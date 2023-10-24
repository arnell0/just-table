# just-table
A simple React table component that just works.  

| Parameter | Default Value | Comment |
| --- | --- | --- |
| data | [] | array of objects |
| columns | [] | array of objects |
| fullWidth | true | if true, table will take 100% width of parent container |
| autoGenerateColumns | true | if true, columns will be generated from data keys, if false, columns must be provided (camel case, underscore, dash) |
| pagination | true | if true, pagination will be enabled |
| paginationSize | 10 | number of rows per page (pagination have to be enabled) |
| search | true | if true, search will be enabled (search by all columns) |
| stickyHeader | true | if true, header will be sticky |
| stickyFooter | true | if true, footer will be sticky |
| styled | false | if true, table will be styled with base styling |
| onRowClick | (row) => {} | function to be called when row is expanded |
| onRowCreate | () => {} | function to be called when row is created |
| onColumnClick | (column) => {} | function to be called when column is expanded |
| onColumnCreate | () => {} | function to be called when column is created |

# example
```javascript
import Table from 'just-table';

const data = [
    {
        'id': 1,
        'name': 'John',
        'surname': 'Doe',
        'age': 25,
    },
    {
        'id': 2,
        'name': 'Jane',
        'surname': 'Doe',
        'age': 23,
    },
]

// columns can be generated from data keys (camel case, underscore, dash) if autoGenerateColumns is true or columns can be provided manually

// with autoGenerateColumns
const JustTable = () => <Table data={data} /> // yes it's that simple


// with columns
const columns = [
    'id',
    'name',
    'surname',
    'age',
]

const JustTable = () => <Table data={data} columns={columns} />
```

# styling
Styling is simple, if you want to style table, you can pass styled prop to table component and it will be styled with base styling. If you want to style table yourself, you can target the following classes and style them as you wish. Or you can target the table and style it yourself.

classes:
- just-wrapper
- just-table
- just-thead
- just-thead-tr
- just-thead-tr-td
- just-tbody
- just-tbody-tr
- just-tbody-tr-td
- just-tfoot
- just-tfoot-tr
- just-tfoot-tr-td
- just-pagination
- just-pagination-page
- just-pagination-select
- just-pagination-button
- just-search-box
- just-search-box-input
- just-search-box-result


# TODO
- [x] pagination
- [x] search
- [x] style serach
- [x] rows per page
- [x] sticky header and footer
- [x] sort columns
- [x] onRowClick
- [x] onRowCreate
- [x] onColumnClick
- [x] onColumnCreate
- [ ] select rows
- [ ] 
- [ ] filter columns
- [ ] change all buttons to icons if user sets icons=true
- [ ] virtualize
- [ ] handle nested data



