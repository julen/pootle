/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import React, { PropTypes } from 'react';
import { Table } from 'reactabular';


const BrowsingElement = ({ href, icon, label }) => (
  <a href={href}>
    <i className={'icon-' + icon}></i> <span>{label}</span>
  </a>
);
BrowsingElement.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};


const BrowsingTable = React.createClass({

  propTypes: {
    data: PropTypes.object.isRequired,
  },

  render() {
		const data = this.props.data.items;
    console.log(this.props.data.items);
		const columns = [
			{
        header: {
          label: gettext('Name'),
        },
        cell: {
          property: 'name',
          format: name => (
            <BrowsingElement
              icon={name.icon}
              href={name.href}
              label={name.title}
            />
          ),
        },
			},
      //{
        //header: {
          //label: gettext('Progress'),
        //},
        //cell: {
          //property: 'progress',
          //format: progress => <span>{progress.href}</span>,
        //},
      //},
			//{
        //header: {
          //value: 'Total',
        //},
        //cell: {
          //property: 'total',
        //},
			//},
			//{
        //header: {
          //value: 'Last Updated',
        //},
        //cell: {
          //property: 'last-updated',
        //},
			//},
			//{
        //header: {
          //value: 'Critical',
        //},
        //cell: {
          //property: 'critical',
        //},
			//},
		];

    return (
			<Table
				className="pure-table pure-table-striped"
				columns={columns}
				data={data}
			>
				<Table.Header />

				<Table.Body rowKey="id" />
			</Table>
    );
  },

});


export default BrowsingTable;
