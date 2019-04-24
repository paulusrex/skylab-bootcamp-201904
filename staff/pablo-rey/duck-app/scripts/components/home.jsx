function Home(props) {
  
  const [items, setItems] = React.useState([]);
  const [detailDuck, setDetailDuck] = React.useState(null);

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
      <SearchForm
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
