import React from 'react'
import logic from '../../logic'

function CardDuck({ item, onDetail, onToggleFavorite }) {
  function onSelect(e) {
    e.preventDefault();
    onDetail(item);
  }

  return (
    <li className="duck-item" >
      <img src={item.imageUrl} className="duck-item__image" onClick={onSelect} />
      <h3 className="duck-item__title">{item.title}</h3>
      <span className="duck-item__price">{item.price}</span>
      <i className={`fas fa-heart ${item.isFavorite ? 'favoriteOn' : ''}`} onClick={() => onToggleFavorite(item)}></i>
    </li>
  );
}

export default CardDuck