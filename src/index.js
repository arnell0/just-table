import React from 'react';
import ReactDOM from 'react-dom/client';
import Table from './just-table';

function Example() {

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


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Example />
  </React.StrictMode>
);

