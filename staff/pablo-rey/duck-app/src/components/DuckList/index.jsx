import React from 'react'
import CardDuck from '../CardDuck'

function DuckList({ items, onDetail }) {
  if (items.length === 0) return <></>;
  return (
    <ul>
      {items.map(item => (
        <CardDuck key={item.id} item={item} onDetail={onDetail} />
      ))}
    </ul>
  );
}

export default DuckList