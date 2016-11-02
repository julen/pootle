# -*- coding: utf-8 -*-
#
# Copyright (C) Pootle contributors.
#
# This file is a part of the Pootle project. It is distributed under the GPL3
# or later license. See the LICENSE file for a copy of the license and the
# AUTHORS file for copyright and authorship information.

from django import forms

from pootle.core.forms import PathForm


class StatsForm(PathForm):

    offset = forms.IntegerField(required=False)

    def clean_offset(self):
        offset = self.cleaned_data['offset']
        return offset if offset else 0
