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
      .then(ducks => {
        setItems(ducks.map(duck => ({...duck, isFavorite: logic.isFavorite(duck)})));
      });
  };

  const handleDetail = duck => {
    logic.retrieveDuck(duck.id)
    .then(duckDetail => setDetailDuck(duckDetail))
  };
  
  const handleToggleFavorite = (toggleDuck) => {
    logic.toggleFavorite(toggleDuck)
    setItems(items.map(duck => ({ ...duck, 
        isFavorite: toggleDuck.id === duck.id ? !duck.isFavorite : duck.isFavorite }))
        );
  }

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
        <DuckList 
          items={items} 
          onDetail={handleDetail} 
          onToggleFavorite={handleToggleFavorite}/>
      ) : (
        <DuckDetail
          duck={detailDuck}
          onToggleFavorite={handleToggleFavorite}
          onBack={() => setDetailDuck(null)}
          onBuy={() => {}}
        />
      )}
    </>
  );
}

export default Home