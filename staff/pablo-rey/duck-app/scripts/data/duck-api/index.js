'use strict'

const duckApi = {
    __url__: 'https://duckling-api.herokuapp.com/api',

    searchDucks(query) {
        validate.arguments([
            { name: 'query', value: query, type: 'string' }
        ])
        
        return fetch(`${this.__url__}/search?q=${query}`)
          .then(res => res.json());
    },

    retrieveDuck(id) {
        validate.arguments([
            { name: 'id', value: id, type: 'string' }
        ])

        return fetch(`${this.__url__}/ducks/${id}`)
          .then(res => res.json());

    }
}