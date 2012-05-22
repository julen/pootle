#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright 2010-2011 Zuza Software Foundation
#
# This file is part of Pootle.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, see <http://www.gnu.org/licenses/>.

"""Form fields required for handling Translation Project"""


from django import forms
from django.utils.translation import ugettext_lazy as _

from pootle_translationproject.models import TranslationProject


def make_search_form(*args, **kwargs):
    """A factory that instantiates one of the search forms below."""
    terminology = kwargs.pop('terminology', False)
    if terminology:
        return TermSearchForm(*args, **kwargs)
    else:
        return SearchForm(*args, **kwargs)


class SearchForm(forms.Form):
    """Normal search form for translation projects."""
    search = forms.CharField(widget=forms.TextInput(attrs={'size': '15'}))
    sfields = forms.MultipleChoiceField(
            required=False,
            widget=forms.CheckboxSelectMultiple,
            choices=(
                ('source', _('Source Text')),
                ('target', _('Target Text')),
                ('notes', _('Comments')),
                ('locations', _('Locations'))
            ),
            initial=['source', 'target'],
    )


class TermSearchForm(SearchForm):
    """Search form for terminology projects and pootle-terminology files."""
    # Mostly the same as SearchForm, but defining it this way seemed easiest
    sfields = forms.ChoiceField(
            required=False,
            widget=forms.CheckboxSelectMultiple,
            choices=(
                ('source', _('Source Terms')),
                ('target', _('Target Terms')),
                ('notes', _('Definitions')),
            ),
            initial=['source', 'target'],
    )


class DescriptionForm(forms.ModelForm):

    class Meta:
        model = TranslationProject
        fields = ()
