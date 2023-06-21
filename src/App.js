import React from 'react';
import './Table.css'

function Table(props) {

  const [columns, setColumns] = React.useState([])
  const [values, setValues] = React.useState([])

  const [settings, setSettings] = React.useState({
    autoGenerateColumns: true, // if true, columns will be generated from data keys, if false, columns must be provided (camel case, underscore, dash)
  })

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
      }
    })
    
    setSettings({settings, ..._settings})

    // handle columns
    if (_settings.autoGenerateColumns === true) {
      const _columns = Object.keys(data[0])

      // split by underscore, camel case, dash and capitalize first letter of each word
      _columns.forEach((column, index) => {
        _columns[index] = column.split('_').join(' ') // replace underscore with space
                                .replace(/([A-Z])/g, ' $1') // split by capital letter
                                .split('-').join(' ') // replace dash with space
                                .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') // capitalize first letter of each word
      })

      setColumns(_columns)
    } else {
      if (props.columns == undefined || props.columns.length == 0) {
        throw new Error('Columns must be provided')
      } 
      setColumns(props.columns)
    }

    // handle values
    const _values = data.map(item => Object.values(item).map(value => {
      if (Array.isArray(value)) {
        return JSON.stringify(value)
      }
      return value
    }))
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


  return (
    <div>
      <table>
        <Thead />
        <Tbody />
      </table>  
    </div>
  )
}


function App() {



  const data = [
    {
      id: 1,
      firstName: 'John',
      last_name: 'Doe',
      age: 44,
    },
    {
      id: 2,
      firstName: 'Peter',
      last_name: 'Parker',
      age: 12,
    },
  ]

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
      />
    </div>
  );
}

export default App;
