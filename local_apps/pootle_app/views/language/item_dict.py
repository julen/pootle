#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright 2009 Zuza Software Foundation
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

"""Helper functions for the rendering of several items on the index views and
similar pages."""

from django.utils.translation import ugettext as _
from django.utils.translation import ungettext

from pootle_misc.versioncontrol import hasversioning
from pootle_app.models.permissions     import check_permission
from pootle_store.models               import Store
from pootle_app.views.language         import dispatch
from pootle_misc.util import add_percentages

################################################################################

def get_item_summary(request, quick_stats, path_obj):
    translated_words = quick_stats['translatedsourcewords']
    total_words      = quick_stats['totalsourcewords']

    # The translated word counts
    word_stats = _("%(translated)d/%(total)d words (%(translatedpercent)d%%) translated",
                   {"translated": translated_words,
                    "total": total_words,
                    "translatedpercent": quick_stats['translatedpercentage']})

    # The translated unit counts
    string_stats_text = _("%(translated)d/%(total)d strings",
                          {"translated": quick_stats['translated'],
                           "total": quick_stats['total']})
    string_stats = '<span class="string-statistics">[%s]</span>' % string_stats_text

    # The whole string of stats
    if not path_obj.is_dir:
        summary = '%s %s' % (word_stats, string_stats)
    else:
        num_stores = Store.objects.filter(pootle_path__startswith=path_obj.pootle_path).count()
        file_stats = ungettext("%d file", "%d files", num_stores, num_stores)
        summary = '%s %s %s' % (file_stats, word_stats, string_stats)

    return summary

def get_terminology_item_summary(request, quick_stats, path_obj):
    # The translated unit counts
    string_stats_text = _("%(translated)d/%(total)d terms",
                          {"translated": quick_stats['translated'],
                           "total": quick_stats['total']})
    string_stats = '<span class="string-statistics">%s</span>' % string_stats_text

    # The whole string of stats
    if not path_obj.is_dir:
        summary = string_stats
    else:
        num_stores = Store.objects.filter(pootle_path__startswith=path_obj.pootle_path).count()
        file_stats = ungettext("%d file", "%d files", num_stores, num_stores)
        summary = '%s %s' % (file_stats, string_stats)

    return summary

def get_item_stats(request, quick_stats, path_obj, show_checks=False, terminology=False):
    if terminology:
        summary = get_terminology_item_summary(request, quick_stats, path_obj)
    else:
        summary = get_item_summary(request, quick_stats, path_obj)

    result = {
        'summary': summary,
        'checks': [],
        }
    if show_checks and not terminology:
        result['checks'] = getcheckdetails(request, path_obj)
    return result

def getcheckdetails(request, path_obj):
    """return a list of strings describing the results of
    checks"""
    checklinks = []
    try:
        property_stats = path_obj.getcompletestats()
        quick_stats = path_obj.getquickstats()
        total = quick_stats['total']
        keys = property_stats.keys()
        keys.sort()
        for checkname in keys:
            checkcount = property_stats[checkname]
            if total and checkcount:
                stats = ungettext('%(checks)d string (%(checkspercent)d%%) failed',
                                  '%(checks)d strings (%(checkspercent)d%%) failed', checkcount,
                                  {"checks": checkcount, "checkspercent": (checkcount * 100) / total})
                checklink = {'href': dispatch.translate(path_obj, check=checkname),
                             'text': checkname,
                             'stats': stats}
                checklinks += [checklink]
    except IOError:
        pass
    return checklinks

################################################################################

def review_link(request, path_obj):
    try:
        if path_obj.has_suggestions():
            if check_permission('translate', request):
                text = _('Review Suggestions')
            else:
                text = _('View Suggestions')
            return {
                    'class': 'translate',
                    'href': dispatch.translate(path_obj, suggestions=True),
                    'text': text}
    except IOError:
        pass

def quick_link(request, path_obj):
    try:
        if path_obj.getquickstats()['translated'] < path_obj.getquickstats()['total']:
            if check_permission('translate', request):
                text = _('Quick Translate')
            else:
                text = _('View Untranslated')
            return {
                    'class': 'translate',
                    'href': dispatch.translate(path_obj, state='incomplete'),
                    'text': text}
    except IOError:
        pass

def translate_all_link(request, path_obj):
    #FIXME: what permissions to check for here?
    return {
        'class': 'translate',
        'href': dispatch.translate(path_obj),
        'text': _('Translate All')}

def zip_link(request, path_obj):
    if check_permission('archive', request):
        text = _('ZIP of directory')
        link = dispatch.download_zip(request, path_obj)
        return {
            'class': 'file download',
            'href': link,
            'text': text,
            }

def xliff_link(request, path_obj):
    if path_obj.translation_project.project.localfiletype == 'xlf':
        return

    if path_obj.translation_project.project.is_monolingual():
        text = _('Translate offline')
        tooltip = _('Download XLIFF file for offline translation')
    else:
        text = _('Translate offline')
        tooltip = _('Download XLIFF file for offline translation')
    href = dispatch.export(request, path_obj.pootle_path, 'xlf')
    return {
        'class': 'translate download',
        'href': href,
        'text': text,
        'title': tooltip,
        }

def download_link(request, path_obj):
    if path_obj.file != "":
        if path_obj.translation_project.project.is_monolingual():
            text = _('Export')
            tooltip = _('Export translations')
        else:
            text = _('Download')
            tooltip = _('Download file')

        return {
            'class': 'file download',
            'href': '%s/download/' % path_obj.pootle_path,
            'text': text,
            'title': tooltip,
            }

def upload_link(request, path_obj):
        #FIXME: check for upload permissions
        text = _('Upload Translated File')
        tooltip = _('Open dialog for file upload/merge')
        link = 'javascript:alert("Not implemented")' #FIXME: provide actual link
        return {
            'class': 'translate upload',
            'href': link,
            'text': text,
            'title': tooltip,
            }

def commit_link(request, path_obj):
    if path_obj.abs_real_path and check_permission('commit', request) and hasversioning(path_obj.abs_real_path):
        link = dispatch.commit(request, path_obj)
        text = _('Commit to VCS')
        return {
            'class': 'vcs commit',
            'href': link,
            'text': text,
            'link': link,
        }

def update_link(request, path_obj):
    if path_obj.abs_real_path and check_permission('commit', request) and hasversioning(path_obj.abs_real_path):
        link = dispatch.update(request, path_obj)
        text = _('Update from VCS')
        return {
            'class': 'vcs update',
            'href': link,
            'text': text,
            'link': link,
        }

def update_all_link(request, path_obj):
    # Directory.get_real_path() doesn't give an absolute path :-(
    if check_permission('commit', request) and hasversioning(path_obj.get_real_path()):
        link = 'javascript:alert("Not implemented")' #FIXME: provide actual link
        text = _('Update from VCS')
        return {
            'class': 'vcs update',
            'href': link,
            'text': text,
            'link': link,
        }

def _gen_link_list(request, path_obj, linkfuncs):
    links = []
    for linkfunc in linkfuncs:
        link = linkfunc(request, path_obj)
        if link is not None:
            links.append(link)
    return links

def store_translate_links(request, path_obj):
    """returns a list of links for store items in translate tab"""
    linkfuncs = [quick_link, translate_all_link, xliff_link, download_link, update_link, commit_link]
    return _gen_link_list(request, path_obj, linkfuncs)

def store_review_links(request, path_obj):
    """returns a list of links for store items in review tab"""
    linkfuncs = [review_link]
    return _gen_link_list(request, path_obj, linkfuncs)

def directory_translate_links(request, path_obj):
    """returns a list of links for directory items in translate tab"""
    return _gen_link_list(request, path_obj, [quick_link, translate_all_link, upload_link, zip_link])

def directory_review_links(request, path_obj):
    """returns a list of links for directory items in review tab"""
    return _gen_link_list(request, path_obj, [review_link])


################################################################################


def stats_descriptions(quick_stats):
    """Provides a dictionary with two textual descriptions of the work
    outstanding."""

    untranslated = quick_stats["untranslatedsourcewords"]
    fuzzy = quick_stats["fuzzysourcewords"]
    todo_words = untranslated + fuzzy
    todo_text = ungettext("%d word needs attention",
            "%d words need attention", todo_words, todo_words)

    todo_tooltip = u""
    untranslated_tooltip = ungettext("%d word untranslated", "%d words untranslated", untranslated, untranslated)
    fuzzy_tooltip = ungettext("%d word needs review", "%d words need review", fuzzy, fuzzy)
    # Firefox and Opera doesn't actually support newlines in tooltips, so we
    # add some extra space to keep things readable
    todo_tooltip = u"  \n".join([untranslated_tooltip, fuzzy_tooltip])

    return {
        'todo_text': todo_text,
        'todo_words': todo_words,
        'todo_tooltip': todo_tooltip,
    }

def make_generic_item(request, path_obj, action, show_checks=False, terminology=False):
    """Template variables for each row in the table.

    make_directory_item() and make_store_item() will add onto these variables."""
    try:
        quick_stats = add_percentages(path_obj.getquickstats())
        info = {
            'href':    action,
            'data':    quick_stats,
            'tooltip': _('%(percentage)d%% complete' %
                         {'percentage': quick_stats['translatedpercentage']}),
            'title':   path_obj.name,
            'stats':   get_item_stats(request, quick_stats, path_obj, show_checks, terminology),
            }
        errors = quick_stats.get('errors', 0)
        if errors:
            info['errortooltip'] = ungettext('Error reading %d file', 'Error reading %d files', errors, errors)
        info.update(stats_descriptions(quick_stats))
    except IOError, e:
        info = {
            'href': action,
            'title': path_obj.name,
            'errortooltip': e.strerror,
            'data': {'errors': 1},
            }
    return info

def make_directory_item(request, directory, links_required=None, terminology=False):
    action = dispatch.show_directory(request, directory.pootle_path)
    show_checks = links_required == 'review'
    item = make_generic_item(request, directory, action, show_checks, terminology)
    if links_required == 'translate':
        item['actions'] = directory_translate_links(request, directory)
    elif links_required == 'review':
        item['actions'] = directory_review_links(request, directory)
    else:
        item['actions'] = []
    item.update({
            'icon': 'folder',
            'isdir': True})
    return item

def make_store_item(request, store, links_required=None, terminology=False):
    action = dispatch.translate(store)
    show_checks = links_required == 'review'
    item = make_generic_item(request, store, action, show_checks, terminology)
    if links_required == 'translate':
        item['actions'] = store_translate_links(request, store)
    elif links_required == 'review':
        item['actions'] = store_review_links(request, store)
    else:
        item['actions'] = []
    item['href_todo'] = dispatch.translate(store, state='incomplete')
    item.update({
            'icon': 'page',
            'isfile': True})
    return item
