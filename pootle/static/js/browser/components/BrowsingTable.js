/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import React, { PropTypes } from 'react';
import { Table } from 'reactabular';

import UserEvent from 'components/UserEvent';


const MissingData = () => (
  <span>—</span>
);


const BrowsingElement = ({ href, icon, label }) => (
  <a href={href}>
    <i className={`icon-${icon}`}></i> <span>{label}</span>
  </a>
);
BrowsingElement.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};


const Progressbar = ({ total, translated, fuzzy }) => {
  const translatedCount = nicePercentage(translated, total, 100);
  const fuzzyCount = nicePercentage(fuzzy, total, 0);
  const untranslatedCount = 100 - translated - fuzzyCount;

  // TODO: make tooltip usable
  const tooltip = (
    <div>
      <span className="legend translated"></span>
        <span className="value translated">{translated}</span>% translated<br />
      <span className="legend fuzzy"></span>
        <span className="value fuzzy">{fuzzyCount}</span>% needs work<br />
      <span className="legend untranslated"></span>
        <span className="value untranslated">{untranslatedCount}</span>% untranslated
    </div>
  );
  return (
    <table className="graph">
      <tbody>
        <tr>
          <td className="translated"><span>{translatedCount}</span></td>
          <td className="fuzzy"><span>{fuzzyCount}</span></td>
          <td className="untranslated"><span>{untranslatedCount}</span></td>
        </tr>
      </tbody>
    </table>
  );
};
Progressbar.propTypes = {
  total: PropTypes.number.isRequired,
  translated: PropTypes.number.isRequired,
  fuzzy: PropTypes.number.isRequired,
};


function nicePercentage(part, total, noTotalDefault) {
  const percentage = total ? part / total * 100 : noTotalDefault;
  if (percentage > 99 && percentage < 100) {
    return 99;
  }
  if (percentage > 0 && percentage < 1) {
    return 1;
  }
  return Math.round(percentage);
}


const BrowsingTable = React.createClass({

  propTypes: {
    data: PropTypes.array.isRequired,
  },

  render() {
		const columns = [
			{
        property: 'name',
        header: {
          label: gettext('Name'),
        },
        cell: {
          format: name => (
            <BrowsingElement
              icon={name.icon}
              href={name.href}
              label={name.title}
            />
          ),
        },
			},
      {
        property: 'progress',
        header: {
          label: gettext('Progress'),
        },
        cell: {
          format: progress => (
            progress ?
              <Progressbar
                total={progress.total}
                translated={progress.translated}
                fuzzy={progress.fuzzy}
              /> :
              <MissingData />
          ),
        },
      },
      {
        property: 'total',
        header: {
          label: gettext('Total'),
        },
        cell: {
          format: total => (
            <a href={total.href}>{total.count}</a>
          )
        },
      },
			//{
        //header: {
          //value: 'Last Updated',
        //},
        //cell: {
          //property: 'last-updated',
        //},
			//},
      {
        property: 'critical',
        header: {
          label: gettext('Critical'),
        },
        cell: {
          format: critical => (
            critical ?
              <a href={critical.href}>{critical.count}</a> :
              <MissingData />
          )
        },
      },
      {
        property: 'suggestions',
        header: {
          label: gettext('Suggestions'),
        },
        cell: {
          format: suggestion => (
            suggestion ?
              <a href={suggestion.href}>{suggestion.count}</a> :
              <MissingData />
          )
        },
      },
      {
        property: 'todo',
        header: {
          label: gettext('Need Translation'),
        },
        cell: {
          format: todo => (
            todo ?
              <a href={todo.href}>{todo.count}</a> :
              <MissingData />
          )
        },
      },
      {
        property: 'last_event',
        header: {
          label: gettext('Last Activity'),
        },
        cell: {
          format: event => (
            event ?
              <UserEvent
                checkName={event.check_name}
                checkDisplayName={event.check_display_name}
                displayName={event.displayname}
                email={event.email}
                displayDatetime={event.display_datetime}
                isoDatetime={event.iso_datetime}
                type={event.type}
                translationActionType={event.translation_action_type}
                unitSource={event.unit_source}
                unitUrl={event.unit_url}
                username={event.username}
              /> :
              <MissingData />
          )
        },
      },
		];

    return (
			<Table.Provider
        className="stats"
				columns={columns}
        rowKey="id"
			>
				<Table.Header className="stats" />

        <Table.Body
          rowKey="id"
          rows={this.props.data}
        />
			</Table.Provider>
    );
  },

});


export default BrowsingTable;
