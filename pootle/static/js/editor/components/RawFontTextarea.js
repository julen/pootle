/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import assign from 'object-assign';
import Mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

import AutosizeTextarea from 'components/AutosizeTextarea';

import { CHARACTERS, SYMBOLS, raw2sym, sym2raw } from '../utils/font';

const KEY_BACKSPACE = 8;
const KEY_RIGHT = 39;
const KEY_DELETE = 46;
const KEY_LETTER_F = 70;

const UNDO_SHORTCUT = 'mod+z';
const REDO_SHORTCUT = 'mod+shift+z';


const RawFontTextarea = React.createClass({

  propTypes: {
    autoFocus: React.PropTypes.bool,
    id: React.PropTypes.string,
    initialValue: React.PropTypes.string,
    isDisabled: React.PropTypes.bool,
    isRawMode: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    overrideValue: React.PropTypes.any,
    style: React.PropTypes.object,
    value: React.PropTypes.string.isRequired,
  },

  contextTypes: {
    currentLocaleCode: React.PropTypes.string,
    currentLocaleDir: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      initialValue: '',
    };
  },

  getInitialState() {
    return {
      done: [],
      undone: [],
    };
  },

  componentWillMount() {
    this.saveSnapshot = _.debounce(this.saveSnapshot, 300, true);
  },

  componentDidMount() {
    this.mousetrap = new Mousetrap(this._textareaNode);
    this.mousetrap.bind(UNDO_SHORTCUT, this.handleUndo);
    this.mousetrap.bind(REDO_SHORTCUT, this.handleRedo);

    this.isComposing = false;
    this.isDirty = false;

    this.offset = null;
    this.selectionStart = null;
    this.selectionEnd = null;
  },

  componentWillReceiveProps(nextProps) {
    // FIXME: this is a hack to support external components adding items right
    // away to the history of changes. It should be removed in the future, once
    // `Editor` is free of outside world interactions.
    if (nextProps.overrideValue &&
        this.props.overrideValue !== nextProps.overrideValue) {
      this.saveSnapshot(this.props.value);
    }
  },

  shouldComponentUpdate(nextProps) {
    // Avoid unnecessary re-renders when the undo stack saves snapshots but
    // Only value and mode changes should re-render the textarea — otherwise
    // there are many unnecessary re-renders when the undo stack saves snapshots.
    return (
      this.isDirty ||
      this.props.value !== nextProps.value ||
      this.props.isRawMode !== nextProps.isRawMode
    );
  },

  componentDidUpdate() {
    const element = this._textareaNode;

    // TODO: `update(valueToInsert)`, but needs to happen elsewhere
    element.value = this.raw2sym(this.props.value);
    element.focus();

    if (this.selectionEnd === null || this.selectionStart === null ||
        this.offset === null) {
      return;
    }

    element.selectionEnd = this.selectionEnd + this.offset;
    console.log('selectionEnd set to ', this.selectionEnd + this.offset)
    if (this.selectionStart === this.selectionEnd) {
      element.selectionStart = this.selectionEnd + this.offset;
      console.log('selectionStart set to ', this.selectionStart + this.offset)
    }

    this.offset = null;
    this.selectionStart = null;
    this.selectionEnd = null;
  },

  componentWillUnmount() {
    this.mousetrap.unbind(UNDO_SHORTCUT);
    this.mousetrap.unbind(REDO_SHORTCUT);
  },

  saveSnapshot(value) {
    this.setState((prevState) => ({
      done: [...prevState.done, value],
      undone: [],
    }));
  },

  handleChange() {
    if (this.isComposing) {
      this.requestUpdate = false;
      return;
    }
    console.log('change')
    const newValue = this.update();
    this.isDirty = true;
    this.saveSnapshot(this.props.value);
    this.props.onChange(newValue);
  },

  handleUndo(e) {
    e.preventDefault();
    if (this.state.done.length === 0) {
      return;
    }

    const currentValue = this.props.value;
    const done = this.state.done.slice();
    const newValue = done.slice(-1)[0];
    this.props.onChange(newValue);

    this.setState((prevState) => ({
      done: done.slice(0, -1),
      undone: [...prevState.undone, currentValue],
    }));
  },

  handleRedo(e) {
    e.preventDefault();
    if (this.state.undone.length === 0) {
      return;
    }

    const currentValue = this.props.value;
    const undone = this.state.undone.slice();
    const newValue = undone.slice(-1)[0];
    this.props.onChange(newValue);

    this.setState((prevState) => ({
      done: [...prevState.done, currentValue],
      undone: undone.slice(0, -1),
    }));
  },

  handleKeyDown(e) {
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
  },

  handleMouseDown() {
    // request selection adjustment after the mousedown event is processed
    // (because now selectionStart/End are not updated yet, even though the
    // caret is already repositioned).
    setTimeout(() => {
      this.adjustSelection();
    }, 0);
  },

  handleMouseUp() {
    this.adjustSelection();
  },

  handleCopyOrCut(e) {
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
  },

  handleCompositionStart() {
    this.isComposing = true;
  },

  handleCompositionEnd() {
    this.isComposing = false;
    // This event is fired after `input` one on Chrome 53+, so in order to
    // actually update the textarea, we need to do this explicitly;
    // for other browsers this means that updateTextarea() would run twice and not
    // in the desired order; so we request this update *after* the default `input`
    // event is processed, and will only run updateTextarea() if it wasn't
    // processed by the native `input` event (on browsers other than Chrome).
    this.requestUpdate = true;
    setTimeout(() => {
      if (this.requestUpdate) {
        this.handleChange();
      }
    }, 0);
  },

  /* ------- */

  raw2sym(value) {
    return raw2sym(value, { isRawMode: this.props.isRawMode });
  },

  sym2raw(value) {
    return sym2raw(value, { isRawMode: this.props.isRawMode });
  },

  // FIXME: factor out to standalone function, so independent code can use it to
  // insert values too.
  update(insertValue = '') {
    const element = this._textareaNode;

    const { selectionStart } = element;
    const { selectionEnd } = element;
    const { value } = element;

    const adjustedStart = insertValue !== '' ? selectionStart : selectionEnd;
    const sBefore = value.substring(0, adjustedStart);
    const sAfter = value.substring(selectionEnd);
    const sBeforeNormalized = this.raw2sym(this.sym2raw(sBefore + insertValue));

    // Save for `componentDidUpdate`
    this.offset = sBeforeNormalized.length - sBefore.length - (selectionEnd - adjustedStart);
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;

    return this.sym2raw(sBefore + insertValue + sAfter);
  },

  adjustSelection(moveRight = false) {
    const element = this._textareaNode;

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
  },

  render() {
    const style = assign({}, {
      boxSizing: 'border-box',
      margin: '0 0 0.5em 0',
      padding: '0.3em',
    }, this.props.style);

    return (
      <AutosizeTextarea
        autoFocus={this.props.autoFocus}
        className="translation focusthis js-translation-area"
        defaultValue={this.raw2sym(this.props.initialValue)}
        dir={this.context.currentLocaleDir}
        disabled={this.props.isDisabled}
        id={this.props.id}
        lang={this.context.currentLocaleCode}
        onChange={this.handleChange}
        onCompositionStart={this.handleCompositionStart}
        onCompositionEnd={this.handleCompositionEnd}
        onKeyDown={this.handleKeyDown}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        ref={(textarea) => {
          if (textarea !== null) {
            // `textarea` doesn't hold the actual DOM textarea; it is a
            // component, hence using `ReactDOM.findDOMNode` here.
            this._textareaNode = ReactDOM.findDOMNode(textarea);
          }
        }}
        style={style}
        value={undefined}
      />
    );
  },

});


export default RawFontTextarea;
