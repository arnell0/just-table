import React from 'react';
import Table from './just-table';


function App() {

  const data = Array.from(Array(10000).keys()).map(item => ({
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