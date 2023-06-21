import React from 'react';
import './Table.css'
import { Virtuoso } from 'react-virtuoso'

function Table(props) {
  const [settings, setSettings] = React.useState({
    fullWidth: true, // if true, table will take 100% width of parent container
    autoGenerateColumns: true, // if true, columns will be generated from data keys, if false, columns must be provided (camel case, underscore, dash)
    pagination: true, // if true, pagination will be enabled
    paginationSize: 10, // number of rows per page
  })

  const [columns, setColumns] = React.useState([])
  const [baseValues, setBaseValues] = React.useState([])
  const [values, setValues] = React.useState([])
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const { data } = props  

    if (data == undefined || data.length == 0) {
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
    console.log(_settings)

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
      if (props.columns == undefined || props.columns.length == 0) {
        throw new Error('Columns must be provided')
      } 
      _columns = props.columns
    }
    setColumns(_columns)
    
    // handle values
    let _values = data.map(item => Object.values(item).map(value => {
      if (Array.isArray(value)) {
        return JSON.stringify(value)
      }
      return value
    }))

    setBaseValues([..._values])

    // handle pagination
    if (_settings.pagination === true) {
      _values = _values.slice((page - 1) * _settings.paginationSize, page * _settings.paginationSize)
    }

    setValues(_values)

  }, [props])

  const Thead = () => {
    return (
      <thead>
        <tr>
          {columns.length > 0 && columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
        </tr>
      </thead>
    )
  }

  const Tbody = () => {
    return (
      <tbody>
        {values.length > 0 && values.map((row, index) => (
          <tr key={index}>
            {row.map((value, index) => (
              <td key={index}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  const Pagination = () => {
    const { paginationSize, data } = props
    const { pagination } = settings

    if (pagination === false) {
      return null
    }

    const pages = Math.ceil(data.length / paginationSize)

    const handlePageChange = (newPage) => {
      let _values = [...baseValues]
      
      _values = _values.slice((newPage - 1) * paginationSize, newPage * paginationSize)
      
      setPage(newPage)
      setValues(_values)
    }
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '5px',
      }}>
        <span>{page}/{pages} </span>
        <button onClick={() => handlePageChange(1)} disabled={page == 1}>{"<<"}</button>
        <button onClick={() => handlePageChange(page - 1)} disabled={page == 1}>{"<"}</button>
        <button onClick={() => handlePageChange(page + 1)} disabled={page == pages}>{">"}</button>
        <button onClick={() => handlePageChange(pages)} disabled={page == pages}>{">>"}</button>
      </div>
    )
  }

  const styles = {
    table: {
      width: settings.fullWidth ? '100%' : 'auto',
    },
  }


  return (
    <div>
      <table style={styles.table}>
        <Thead />
        <Tbody />
        <tfoot>
          <tr>
            <td colSpan={columns.length}>
              <Pagination />
            </td>
          </tr>
        </tfoot>
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
