import React from 'react';
import './styles.css'

function SearchBox(props) {
  const { values, setValues } = props

  const [search, setSearch] = React.useState('')
  const [resultLength, setResultLength] = React.useState(values.length)

  const handleSearch = (e) => {
    const newSearch = e.target.value
    setSearch(newSearch)

    let _values = [...values]

    if (newSearch !== '') {
      if (props.fuzzySearch === true) {
        let matchArray = []

        _values = _values.filter(row => row.some(value => {
          const result = compareTwoStrings(value.toString().toLowerCase(), newSearch.toLowerCase())
          matchArray.push(result)
          return result > 0.5
        }))

        // sort by match
        const sortedMatchArray = [...matchArray].sort((a, b) => b - a)
        _values = _values.sort((a, b) => {
          const aIndex = matchArray.indexOf(sortedMatchArray.find(item => item === matchArray[matchArray.indexOf(a)]))
          const bIndex = matchArray.indexOf(sortedMatchArray.find(item => item === matchArray[matchArray.indexOf(b)]))
          return aIndex - bIndex
        })

      } else { 
        _values = _values.filter(row => row.some(value => value.toString().toLowerCase().includes(newSearch.toLowerCase())))
      }
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
        placeholder={props.fuzzySearch === true ? 'Fuzzy search...' : 'Search...'}
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
    search: true, // if true, search will be enabled (search by all columns)
    fuzzySearch: false, // if true, fuzzy search will be enabled (allow typos and such)
    stickyHeader: true, // if true, header will be sticky
    stickyFooter: true, // if true, footer will be sticky
  })

  const [columns, setColumns] = React.useState([])
  const [baseValues, setBaseValues] = React.useState([])
  const [values, setValues] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [pages, setPages] = React.useState(1)
  const [sortBy, setSortBy] = React.useState({
    column: '',
    order: 'desc',
  })

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

    let mainString = 'Hello World'
    let targetStrings = ['Helo Wrld', 'Hello World', 'Hello World!']
    let result = findBestMatch(mainString, targetStrings)
    console.log(result)


  }, [props])

  const Thead = () => {
    return (
      <thead className='retable-thead' style={{
        position: settings.stickyHeader === true ? 'sticky' : 'relative',
        top: "-1px",
      }}>
        <tr className='retable-thead-tr'>
          {columns.length > 0 && columns.map((column, index) => (
            <th 
              className='retable-thead-tr-td' 
              key={index} 
              onClick={() => handleSort(column)}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {column}
              {
                sortBy.column === column ? (
                  <span className='retable-thead-tr-td-sort'>
                    {sortBy.order === 'asc' ? '▲' : '▼'} 
                  </span>
                ) 
                : 
                <span className='retable-thead-tr-td-sort' style={{
                  color: 'transparent',
                }}>
                  ▲
                </span>
              }
            </th>
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

  const handlePagination = (newPage, _values, newPaginationSize) => {
    let paginationSize = settings.paginationSize

    if (newPaginationSize !== undefined) {
      paginationSize = newPaginationSize
    }

    _values = _values.slice((newPage - 1) * paginationSize, newPage * paginationSize)

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

    const handleRowsPerPageChange = (newPaginationSize) => {
      const newPages = Math.ceil(baseValues.length / newPaginationSize)
      setPages(newPages)

      const newSettings = {...settings}
      newSettings.paginationSize = newPaginationSize
      setSettings(newSettings)

      handlePagination(1, [...baseValues], newPaginationSize  )
    }

    return (
      <tfoot className='retable-tfoot' style={{
        position: settings.stickyFooter === true ? 'sticky' : 'relative',
        bottom: "-1px",
      }}>
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
              <span className='retable-pagination-page'>Rows per page: </span>
              <select
                className='retable-pagination-select'
                onChange={(e) => handleRowsPerPageChange(e.target.value)}
                value={settings.paginationSize}
              >
                {[5, 10, 20, 50, 100].map((value, index) => (
                  <option key={index} value={value}>{value}</option>
                ))}
              </select>

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

  const handleSort = (column) => {
    let _baseValues = [...baseValues]
    let _sortBy = {...sortBy}

    if (column === sortBy.column) {
      _sortBy.order = sortBy.order === 'asc' ? 'desc' : 'asc'
    } else {
      _sortBy.column = column
      _sortBy.order = 'asc'
    }

    setSortBy(_sortBy)

    const columnIndex = columns.indexOf(column)
    _baseValues.sort((a, b) => {
      if (a[columnIndex] < b[columnIndex]) {
        return _sortBy.order === 'asc' ? -1 : 1
      }
      if (a[columnIndex] > b[columnIndex]) {
        return _sortBy.order === 'asc' ? 1 : -1
      }
      return 0
    })

    handlePagination(1, _baseValues)
    setBaseValues(_baseValues)
  }

  const Search = (
    <thead className='retable-thead'>
      {
        settings.search === true && 
        <tr className='retable-thead-tr'>
          <td className='retable-thead-tr-td' colSpan={columns.length}>
            <SearchBox values={extractBaseValues(props.data)} setValues={handleSearch} fuzzySearch={settings.fuzzySearch} />
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

export default Table

// taken from https://github.com/aceakash/string-similarity
function compareTwoStrings(first, second) {
	first = first.replace(/\s+/g, '')
	second = second.replace(/\s+/g, '')

	if (first === second) return 1; // identical or empty
	if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

	let firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram) + 1
			: 1;

		firstBigrams.set(bigram, count);
	};

	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram)
			: 0;

		if (count > 0) {
			firstBigrams.set(bigram, count - 1);
			intersectionSize++;
		}
	}

	return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

function findBestMatch(mainString, targetStrings) {
	if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');
	
	const ratings = [];
	let bestMatchIndex = 0;

	for (let i = 0; i < targetStrings.length; i++) {
		const currentTargetString = targetStrings[i];
		const currentRating = compareTwoStrings(mainString, currentTargetString)
		ratings.push({target: currentTargetString, rating: currentRating})
		if (currentRating > ratings[bestMatchIndex].rating) {
			bestMatchIndex = i
		}
	}
	
	
	const bestMatch = ratings[bestMatchIndex]
	
	return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
}

function areArgsValid(mainString, targetStrings) {
	if (typeof mainString !== 'string') return false;
	if (!Array.isArray(targetStrings)) return false;
	if (!targetStrings.length) return false;
	if (targetStrings.find( function (s) { return typeof s !== 'string'})) return false;
	return true;
}