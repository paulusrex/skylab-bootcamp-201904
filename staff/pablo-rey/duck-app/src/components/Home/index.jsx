import React, { useState } from 'react'
import logic from '../../logic'
import Search from '../Search'
import DuckDetail from '../DuckDetail'
import DuckList from '../DuckList'

function Home(props) {
  
  const [items, setItems] = useState([]);
  const [detailDuck, setDetailDuck] = useState(null);

  const handleSearch = searchText => {
    logic.searchDucks(searchText)
      .then(ducks => setItems([...ducks]));
  };

  const handleDetail = duck => {
    logic.retrieveDuck(duck.id)
    .then(duckDetail => setDetailDuck(duckDetail))
  };

  return (
    <>
      <h2>Hello, {props.name}!</h2>
      <Search
        cssClass="home__search"
        selectedLanguage={props.selectedLanguage}
        literals={props.literals}
        onSearch={handleSearch}
      />
      {!detailDuck ? (
        <DuckList items={items} onDetail={handleDetail} />
      ) : (
        <DuckDetail
          duck={detailDuck}
          onBack={() => setDetailDuck(null)}
          onBuy={() => {}}
        />
      )}
    </>
  );
}

export default Home