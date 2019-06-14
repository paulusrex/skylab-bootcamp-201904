import React, { useState, useEffect } from 'react';
import logic from '../../logic'
import './index.sass'

function Terminal() {
    const [orderId, setOrderId] = useState(false)
    const [order, setOrder] = useState(false)
    const [total, setTotal] = useState(false)
    const [error, setError] = useState(false)
    const { pathname } = window.location

    useEffect(() => {
        return (async () => {
            try {
                let acc = 0
                const id = pathname.slice(7)
                const response = await logic.retrieveOrderById(id)
                if (response.message) {
                    setError(`There is no order with this id number ${id}`)
                } else {
                    setOrder(response)
                    response.products.map(elem => {
                        acc += Number(elem.price)
                        setTotal(acc)
                    })
                }

            } catch (err) {
                setError(err.message)
                // if (err.message === `child "id" fails because ["id" with value "${id}" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/]`) setError(`Invalid id ${id}.`)

            }
        })()
    }, [])

    return (
        <section className='g-terminal'>
            <div className='g-terminal-content'>
                <h1 className='g-terminal-content-title'>Order number: {pathname.slice(7)}</h1>
                <div className='g-terminal-content-products'>
                    {order && !error && order.products.map(({ image, title, price }) => {
                        return <article className='g-terminal-content-products-item'>
                            <img src={image} alt={title} />
                            <h2>{title}</h2>
                            <p>{price} €</p>
                        </article>
                    })
                    }
                    <div className='g-terminal-content-total'>
                        {total && !error &&
                            <p>TOTAL: {total} €</p>
                        }
                    </div>
                    {error &&
                        <div className='g-terminal-error'>
                            <h2>{error}</h2>
                        </div>
                    }
                </div>
            </div>
        </section>
    );
}

export default Terminal



