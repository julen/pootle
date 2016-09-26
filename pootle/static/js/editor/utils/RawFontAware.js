/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import { CHARACTERS, SYMBOLS, raw2sym, sym2raw } from './font';

const KEY_BACKSPACE = 8;
const KEY_RIGHT = 39;
const KEY_DELETE = 46;
const KEY_LETTER_F = 70;


export class RawFontAware {

  constructor(element, { isRawMode = false } = {}) {
    this.element = element;
    this.isRawMode = isRawMode;

    this.setValue(element.defaultValue);
    this.update();

    element.addEventListener('input', (e) => this.onInput(e));
    element.addEventListener('keydown', (e) => this.onKeyDown(e));
    element.addEventListener('mousedown', (e) => this.onMouseDown(e));
    element.addEventListener('mouseup', (e) => this.onMouseUp(e));
    element.addEventListener('copy', (e) => this.onCopyOrCut(e));
    element.addEventListener('cut', (e) => this.onCopyOrCut(e));
    element.addEventListener('compositionstart', () => this.onCompositionStart());
    element.addEventListener('compositionend', () => this.onCompositionEnd());
  }

  destroy() {
    const { element } = this;

    element.removeEventListener('input', this.onInput);
    element.removeEventListener('keydown', this.onKeyDown);
    element.removeEventListener('mousedown', this.onMouseDown);
    element.removeEventListener('mouseup', this.onMouseUp);
    element.removeEventListener('copy', this.onCopyOrCut);
    element.removeEventListener('cut', this.onCopyOrCut);
    element.removeEventListener('compositionstart', this.onCompositionStart);
    element.removeEventListener('compositionend', this.onCompositionEnd);

    this.element = null;
  }

  setMode({ isRawMode = false } = {}) {
    this.isRawMode = isRawMode;
    this.update();
  }

  getValue() {
    return this.sym2raw(this.element.value);
  }

  setValue(value) {
    this.element.value = this.raw2sym(value);
    return this.getValue();
  }

  update(insertValue = '') {
    const { element } = this;

    const start = element.selectionStart;
    const end = element.selectionEnd;
    const { value } = element;
    const adjustedStart = insertValue !== '' ? start : end;
    const sBefore = value.substring(0, adjustedStart);
    const sAfter = value.substring(end);
    const sBeforeNormalized = this.raw2sym(this.sym2raw(sBefore + insertValue));
    const offset = sBeforeNormalized.length - sBefore.length - (end - adjustedStart);
    const newValue = this.raw2sym(this.sym2raw(sBefore + insertValue + sAfter));
    if (value === newValue) {
      return;
    }

    element.value = newValue;
    element.selectionEnd = end + offset;
    if (start === end) {
      element.selectionStart = end + offset;
    }
  }

  raw2sym(value) {
    return raw2sym(value, { isRawMode: this.isRawMode });
  }

  sym2raw(value) {
    return sym2raw(value, { isRawMode: this.isRawMode });
  }

  onMouseDown() {
    // request selection adjustment after
    // the mousedown event is processed
    // (because now selectionStart/End are not updated yet,
    // even though the caret is already repositioned)
    setTimeout(() => {
      this.adjustSelection();
    }, 0);
  }

  onMouseUp() {
    this.adjustSelection();
  }

  onKeyDown(e) {
    const { target } = e;
    // request selection adjustment after the keydown event is processed

    // on Mac, there's a Control+F alternative to pressing right arrow
    const moveRight = (
      e.keyCode === KEY_RIGHT || (e.ctrlKey && e.keyCode === KEY_LETTER_F)
    );

    setTimeout(() => {
      this.adjustSelection(moveRight);
    }, 0);

    let start = target.selectionStart;
    let end = target.selectionEnd;
    const { value } = target;

    // IE11 sometimes has start/end set past the actual string length,
    // so adjust the selection to be able to get proper charBefore/charAfter values
    if (start > value.length) {
      start = value.length;
    }
    if (end > value.length) {
      end = value.length;
    }

    const charBefore = value.substr(end - 1, 1);
    const charAfter = value.substr(end, 1);

    if (start === end) {
      // when there's no selection and Delete key is pressed
      // before LF symbol, select two characters to the right
      // to delete them in one step
      if (e.keyCode === KEY_DELETE && charAfter === SYMBOLS.LF) {
        target.selectionEnd = end + 2;
        return;
      }

      // when there's no selection and Backspace key is pressed
      // after newline character, select two characters to the left
      // to delete them in one step
      if (e.keyCode === KEY_BACKSPACE && charBefore === CHARACTERS.LF) {
        target.selectionStart = start - 2;
      }
    }
  }

  onCopyOrCut(e) {
    // on cut or copy, we want to have raw text in clipboard (without special
    // characters) for interoperability with other applications and parts of the
    // UI
    e.preventDefault();

    const { target } = e;

    // get selection, convert it and put into clipboard
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const selection = this.sym2raw(target.value.substring(start, end));

    // IE11 uses `Text` instead of `text/plain` content type
    // and global window.clipboardData instead of e.clipboardData
    if (e.clipboardData) {
      e.clipboardData.setData('text/plain', selection);
    } else {
      window.clipboardData.setData('Text', selection);
    }

    // replace current selection with the empty string
    // (otherwise with the default event being cancelled
    // the selection won't be deleted)
    if (e.type === 'cut') {
      this.insertAtCaret('');
    }
  }

  onInput() {
    if (!this.isComposing) {
      this.update();
    }
    this.requestUpdate = false;
  }

  onCompositionStart() {
    this.isComposing = true;
  }

  onCompositionEnd() {
    this.isComposing = false;
    // This event is fired after `input` one on Chrome 53+, so in order to
    // actually update the textarea, we need to do this explicitly;
    // for other browsers this means that updateTextarea() would run twice and not
    // in the desired order; so we request this update *after* the default `input`
    // event is processed, and will only run updateTextarea() if it wasn't
    // processed by the native `input` event (on browsers other than Chrome).
    this.requestUpdate = true;
    setTimeout(() => {
      if (self.requestUpdate) {
        this.update();
      }
    }, 0);
  }

  adjustSelection(moveRight) {
    const { element } = this;

    const start = element.selectionStart;
    const end = element.selectionEnd;
    const { value } = element;

    const charBefore = value.substr(end - 1, 1);
    const charAfter = value.substr(end, 1);
    const insideLF = charBefore === SYMBOLS.LF && charAfter === CHARACTERS.LF;
    const selection = value.substring(start, end);

    // if newline is selected via mouse double-click,
    // expand the selection to include the preceding LF symbol
    if (selection === CHARACTERS.LF && value.substr(start - 1, 1) === SYMBOLS.LF) {
      element.selectionStart = element.selectionStart - 1;
      return;
    }

    // if caret is placed between LF symbol and newline,
    // move it one symbol to the right or to the left
    // depending on the keyCode
    if (insideLF) {
      element.selectionEnd = moveRight ? end + 1 : end - 1;
      if (start === end) {
        element.selectionStart = element.selectionEnd;
      }
    }
  }

  insertAtCaret(value) {
    this.update(value);
    return this.getValue();
  }

}
