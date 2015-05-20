/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import cx from 'classnames';
import React from 'react';
import { Link } from 'react-router';


let BrowseLink = React.createClass({
  propTypes: {
    flux: React.PropTypes.object.isRequired,
    to: React.PropTypes.string.isRequired,
  },

  handleClick(e) {
    this.props.flux.getActions('stats').gotoPath(pootlePath);
  },

  render() {
    const { to } = this.props;
    return <Link to={to}>{to}</Link>;
  }
});


let StatsTable = React.createClass({

  propTypes: {
    data: React.PropTypes.object,
  },


  /* Handlers */

  handleGotoPath(pootlePath, e) {
    e.preventDefault();
    this.props.flux.getActions('stats').gotoPath(pootlePath);
  },

  /* Layout */

  renderHeading(heading, i) {
    return (
      <th className={heading.className} key={i}>{heading.display_name}</th>
    );
  },

  renderTableItem(item, key, fields) {
    let rowClassNames = cx({
      item: true,
      'is-disabled': item.is_disabled,
    });

    return (
      <tr className={rowClassNames} key={key}>

      {fields.indexOf('name') !== -1 &&
        <td className={"stats-name " + item.icon}>
          <BrowseLink to={item.pootle_path} />
          <a href="#" onClick={this.handleGotoPath.bind(this, item.pootle_path)}>
            <i className={"icon-" + item.icon}></i>
            <span>{item.pootle_path}</span>
          </a>
        </td>
      }

      {fields.indexOf('progress') !== -1 &&
        <td className="stats-graph">
          <div className="sortkey"></div>
          <div></div>
        </td>
      }

      {fields.indexOf('total') !== -1 &&
        <td className="stats-number total">
          <a className="non-zero" href="#">{item.total}</a>
          <span className="zero muted">0</span>
        </td>
      }

      {fields.indexOf('last-updated') !== -1 &&
        <td className="stats last-updated">
        {item.lastupdated ?
          <span dangerouslySetInnerHTML={{__html: item.lastupdated.snippet }} />
          :
          <span>—</span>
        }
        </td>
      }

      {fields.indexOf('need-translation') !== -1 &&
        <td className="stats-number need-translation">
          <a className="non-zero" href="#">{item.total - item.translated}</a>
          <span className="zero muted">0</span>
        </td>
      }

      {fields.indexOf('suggestions') !== -1 &&
        <td className="stats-number suggestions">
          <a className="non-zero" href="#">{item.suggestions}</a>
          <span className="zero muted">0</span>
        </td>
      }

      {fields.indexOf('critical') !== -1 &&
        <td className="stats-number critical">
          <a className="non-zero" href="#">{item.critical}</a>
          <span className="zero muted">0</span>
        </td>
      }

      {fields.indexOf('activity') !== -1 &&
        <td className="last-activity">
        {item.lastaction ?
          <span dangerouslySetInnerHTML={{__html: item.lastaction.snippet }} />
          :
          <span>—</span>
        }
        </td>
      }
      </tr>
    );
  },

  render() {
    /*
     * TODO
     * - sorting
     * - RTL dir, i18n code
     */
    let headings = [
      {id: 'name', className: 'stats', 'display_name': 'Name'},
      {id: 'progress', className: 'stats', 'display_name': 'Progress'},
      {id: 'total', className: 'stats', 'display_name': 'Total'},
      {id: 'last-updated', className: 'stats', 'display_name': 'Last Updated'},
      {id: 'need-translation', className: 'stats', 'display_name': 'Need Translation'},
      {id: 'suggestions', className: 'stats', 'display_name': 'Suggestions'},
      {id: 'critical', className: 'stats', 'display_name': 'Critical'},
      {id: 'activity', className: 'stats', 'display_name': 'Last Activity'},
    ];
    let fields = [
      'name', 'progress', 'total', 'last-updated', 'need-translation',
      'suggestions', 'critical', 'activity'
    ];

    let rows = [];
    for (let key in this.props.data.children) {
      let value = this.props.data.children[key];
      rows.push(this.renderTableItem(value, key, fields));
    }

    return (
      <table className="sortable stats" id="foo" cellPadding="5"
        cellSpacing="0" width="100%">
        <thead>
          <tr>
            {headings.map(this.renderHeading)}
          </tr>
        </thead>
        <tbody className="stats">
          {rows}
        </tbody>
      </table>
    );
  }

});

export default StatsTable;
