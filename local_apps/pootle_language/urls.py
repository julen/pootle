#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright 2008,2012 Zuza Software Foundation
#
# This file is part of Pootle.
#
# Pootle is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# Pootle is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Pootle; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

from django.conf.urls.defaults import *

urlpatterns = patterns('pootle_language.views',
    (r'^(?P<language_code>[^/]*)/(index.html)?$', 'language_index'),
    (r'^(?P<language_code>[^/]*)/admin.html$', 'language_admin'),
    (r'^(?P<language_code>[^/]*)/edit_settings.html$', 'language_settings_edit'),
)
