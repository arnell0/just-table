import React from 'react';
import './Table.css'
import { Virtuoso } from 'react-virtuoso'

function SearchBox(props) {
  const { values, setValues } = props

  const [search, setSearch] = React.useState('')
  const [resultLength, setResultLength] = React.useState(values.length)

  const handleSearch = (e) => {
    const newSearch = e.target.value
    setSearch(newSearch)

    let _values = [...values]
    if (newSearch !== '') {
      _values = _values.filter(row => row.some(value => value.toString().toLowerCase().includes(newSearch.toLowerCase())))
    }
    setValues(_values)
    setResultLength(_values.length)
  }

  return (
    <div 
      className='retable-search-box'
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '5px',
      }
    }>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={handleSearch}
        className='retable-search-box-input'
        style={{
          padding: '8px',
          border: '1px solid #ccc',
        }}
      />
      <span className='retable-search-box-result'> {resultLength} results</span>
    </div>
  )
}


function Table(props) {
  const [settings, setSettings] = React.useState({
    fullWidth: true, // if true, table will take 100% width of parent container
    autoGenerateColumns: true, // if true, columns will be generated from data keys, if false, columns must be provided (camel case, underscore, dash)
    pagination: true, // if true, pagination will be enabled
    paginationSize: 10, // number of rows per page
    searchBox: true, // if true, search will be enabled (search by all columns)
  })

  const [columns, setColumns] = React.useState([])
  const [baseValues, setBaseValues] = React.useState([])
  const [values, setValues] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [pages, setPages] = React.useState(1)

  const extractBaseValues = (data) => {
    return data.map(item => Object.values(item).map(value => {
      if (Array.isArray(value)) {
        return JSON.stringify(value)
      }
      return value
    }))
  }

  // handle pagination size change affected by search 
  React.useEffect(() => {
    const newPages = Math.ceil(baseValues.length / settings.paginationSize)
    setPages(newPages)
  }, [baseValues])

  React.useEffect(() => {
    const { data } = props  

    if (data === undefined || data.length === 0) {
      throw new Error('Data must be provided')
    }

    // handle settings
    const _settings = {}
    Object.keys(settings).forEach(key => {
      if (props[key] !== undefined) {
        _settings[key] = props[key]
      } else {
        _settings[key] = settings[key]
      }
    })
    
    setSettings(_settings)

    // handle columns
    let _columns = []
    if (_settings.autoGenerateColumns === true) {
      _columns = Object.keys(data[0])

      // split by underscore, camel case, dash and capitalize first letter of each word
      _columns.forEach((column, index) => {
        _columns[index] = column.split('_').join(' ') // replace underscore with space
                                .replace(/([A-Z])/g, ' $1') // split by capital letter
                                .split('-').join(' ') // replace dash with space
                                .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') // capitalize first letter of each word
      })
    } else {
      if (props.columns === undefined || props.columns.length === 0) {
        throw new Error('Columns must be provided')
      } 
      _columns = props.columns
    }
    setColumns(_columns)
    
    // handle values
    let _values = extractBaseValues(data)

    setBaseValues([..._values])

    // handle pagination
    if (_settings.pagination === true) {
      _values = _values.slice((page - 1) * _settings.paginationSize, page * _settings.paginationSize)
    }

    setValues(_values)

  }, [props])

  const Thead = () => {
    return (
      <thead className='retable-thead'>
        <tr className='retable-thead-tr'>
          {columns.length > 0 && columns.map((column, index) => (
            <th className='retable-thead-tr-td' key={index}>{column}</th>
          ))}
        </tr>
      </thead>
    )
  }

  const Tbody = () => {
    return (
      <tbody className='retable-tbody'>
        {values.length > 0 && values.map((row, index) => (
          <tr className='retable-tbody-tr' key={index}>
            {row.map((value, index) => (
              <td className='retable-tbody-tr-td' key={index}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  const handlePagination = (newPage, _values) => {
    _values = _values.slice((newPage - 1) * settings.paginationSize, newPage * settings.paginationSize)

    setPage(newPage)
    setValues(_values)
  }

  const Pagination = () => {
    const { pagination } = settings

    if (pagination === false) {
      return null
    }

    const handlePageChange = (newPage) => {
      handlePagination(newPage, [...baseValues])
    }

    return (
      <tfoot className='retable-tfoot'>
        <tr className='retable-tfoot-tr'>
          <td className='retable-tfoot-tr-td' colSpan={columns.length}>
            <div 
              className='retable-pagination'
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span className='retable-pagination-page'>{page}/{pages} </span>
              <button className='retable-pagination-button' onClick={() => handlePageChange(1)} disabled={page === 1}>{"<<"}</button>
              <button className='retable-pagination-button' onClick={() => handlePageChange(page - 1)} disabled={page === 1}>{"<"}</button>
              <button className='retable-pagination-button' onClick={() => handlePageChange(page + 1)} disabled={page === pages}>{">"}</button>
              <button className='retable-pagination-button' onClick={() => handlePageChange(pages)} disabled={page === pages}>{">>"}</button>
            </div>
          </td>
        </tr>
      </tfoot>
    )
  }

  const handleSearch = (newValues) => {
    handlePagination(1, newValues)
    setBaseValues(newValues)
  }

  const Search = (
    <thead className='retable-thead'>
      {
        settings.searchBox === true && 
        <tr className='retable-thead-tr'>
          <td className='retable-thead-tr-td' colSpan={columns.length}>
            <SearchBox values={extractBaseValues(props.data)} setValues={handleSearch} />
          </td>
        </tr> 
      }
    </thead>
  )

  return (
    <div className='retable-table-wrapper'>
      <table 
        className='retable-table'
        style={{
          width: settings.fullWidth ? '100%' : 'auto',
        }}
      >
        {Search}
        <Thead />
        <Tbody />
        <Pagination />
      </table>  
    </div>
  )
}


function App() {

  const data = Array.from(Array(1000).keys()).map(item => ({
    id: item,
    first_name: 'John',
    last_name: 'Doe',
    age: 30,
    random: Math.round(Math.random() * 10000),
  }))

  const columns = [
    'Id',
    'First Name',
    'Last Name',
    'Age',
  ]

  return (
    <div>
      <Table 
        data={data}
        autoGenerateColumns={true}
        // columns={columns}
        pagination={true}
        paginationSize={10}
      />
    </div>
  );
}

export default App;
