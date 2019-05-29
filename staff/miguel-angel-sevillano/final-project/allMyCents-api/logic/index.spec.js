require('dotenv').config()
const bcrypt = require('bcryptjs');
const expect = require('chai').expect
const logic = require('.')
const { errors: { LogicError } } = require('allMyCents-utils')
const { models: { User, Item }, mongoose } = require('allMyCents-data')

const { env: { MONGO_URL_LOGIC_TEST: url } } = process


describe('logic', () => {


    before(() => mongoose.connect(url, { useNewUrlParser: true }))

    const name = 'Miguel'
    const surname = 'Sevillano'
    let email
    const password = '123'
    let cryptPass = bcrypt.hashSync(password, 8)
   

    beforeEach(async () => {


        await Item.deleteMany()
        email = `MiguelAngel-${Math.random()}@gmail.com`

    })

    describe('users', () => {

        describe('register user', () => {

            it('should succeed on correct user data', async () => {

                const res = await logic.registerUser(name, surname, email, password)

                expect(res).to.be.undefined

            })

            describe('on already existing user', () => {

                beforeEach(async () => await User.create({ name, surname, email, password }))

                it('should fail on retrying to register', async () => {

                    try {
                        await logic.registerUser(name, surname, email, password)

                        throw Error('should not reach this point')

                    } catch (error) {

                        expect(error).to.exist
                        expect(error).to.be.instanceOf(LogicError)
                        expect(error.message).to.equal(`user with email "${email}" already exists`)
                    }
                })
            })
        })

        describe('authenticate user', () => {
            

            beforeEach(async () => {
                await User.create({ name, surname, email, password:cryptPass })
            })


            it('should succeed on correct user credential', async () => {

                const id = await logic.authenticateUser(email, password)

                expect(typeof id).to.be.a('string')
                expect(id.length).to.be.greaterThan(0)
            })

            it('should fail on non-existing user', async () => {

                try {
                    await logic.authenticateUser(email = 'unexisting-user@mail.com', password)

                    throw Error('should not reach this point')
                } catch (error) {

                    expect(error).to.exist
                    expect(error).to.be.instanceOf(LogicError)
                    expect(error.message).to.equal("wrong credentials")
                }
            })
        })

        describe('retrieve user', () => {

            let id

            beforeEach(async () => {

                const users = await User.create({ name, surname, email, password })
                id = users.id

            })

            it('should succeed on correct user id from existing user', async () => {

                const user = await logic.retrieveUser(id)


                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(email)

            })

            it('should fail on unexisting user id', async () => {

                id = '01234567890123456789abcd'

                try {
                    await logic.retrieveUser(id)
                    throw new Error('should not reach this point')
                } catch (error) {

                    expect(error).to.exist
                    expect(error).to.be.instanceOf(LogicError)
                    expect(error.message).to.equal(`user with id "${id}" does not exist`)
                }
            })
        })

        describe('update user', () => {
            let id
            let updateInfo = {}

            beforeEach(async () => {

                const users = await User.create({ name, surname, email, password })
                id = users.id

                updateInfo = { name: "jose" }

            })

            it('should succed updating user data', async () => {

                await logic.updateUser(id, updateInfo)
                const user = await User.findById(id)
                expect(user.name).to.be.equal(updateInfo.name)
                expect(user.name).to.exist

            })

        })
        describe('delete user', () => {

            let id

            beforeEach(async () => {

                const users = await User.create({ name, surname, email, password })
                id = users.id

            })

            it('should succed deleting user', async () => {

                await logic.deleteUser(id)
                const user = await User.findById(id)
                expect(user).to.equal(null)

            })

        })

        describe('items', () => {
            let newItem

            beforeEach(async () => {

                const users = await User.create({ name, surname, email, password })
                id = users.id

                newItem = { text: `manzana${Math.random()}` }

            })

            it('should succeed adding an item', async () => {

                const item = await logic.addItem(newItem)

                expect(item).to.exist
                expect(item).to.have.length
                expect(item.text).to.equal(newItem.text)

            })


            it('should list all items', async () => {

                await Item.create(newItem)
                await Item.create(newItem)

                const list = await logic.listItems()

                expect(list).to.exist
                expect(list).to.have.length
                expect(list[1].text).to.be.a('string')

            })
        })

        describe('ticket', () => {
            let user
            let id
            let ticket_1 = [{ name: 'manzana', Euro: 1.65 }, { name: 'pera', Euro: 2.75 }]
            let ticket_2 = [{ name: 'platano', Euro: 7.65 }, { name: 'naranja', Euro: 4.75 }]

            beforeEach(async () => {
                user = await User.create({ name, surname, email, password })
                id = user.id
            })

            it('should succeed adding a private ticket', async () => {


                await logic.addPrivateTicket(id, ticket_1)
                const _user = await User.findById(id).lean()
                const { items } = _user.tickets[0]


                expect(items).to.exist
                expect(items).to.have.lengthOf(2)
                expect(items[0].name).to.equal(ticket_1[0].name)
                expect(items[1].name).to.equal(ticket_1[1].name)
            })

            it('should succeed updating a private ticket', async () => {


                await logic.addPrivateTicket(id, ticket_1)
                const user = await User.findById(id).lean()

                const { tickets } = user
                let ticketId = tickets[0]._id
                let data = { name: "VENTILADOR" }
                let position = 1

                await logic.updatePrivateTicket(id, ticketId, data, position)

                const _user = await User.findById(id).lean()
                const { items } = _user.tickets[0]

                expect(items).to.exist
                expect(items).to.have.lengthOf(2)

                expect(items[0].name).to.equal(ticket_1[0].name)
                expect(items[1].name).to.equal(data.name)
            })
            it('should succeed retriving a private ticket', async () => {

                await logic.addPrivateTicket(id, ticket_1)
                await logic.addPrivateTicket(id, ticket_2)

                const _user = await User.findById(id).lean()
                const { tickets } = _user

                let fTicketId = tickets[0]._id
                let sTicketId = tickets[1]._id

                const fTicket = await logic.retrivePrivateTicket(id, fTicketId)

                const { items } = fTicket

                expect(fTicket).to.exist
                expect(items).to.have.lengthOf(2)
                expect(items[0].name).to.equal(ticket_1[0].name)
                expect(items[1].price).to.equal(ticket_1[0].price)

                const sTicket = await logic.retrivePrivateTicket(id, sTicketId)

                const { items: _items } = sTicket

                expect(sTicket).to.exist
                expect(_items).to.have.lengthOf(2)
                expect(_items[0].name).to.equal(ticket_2[0].name)
                expect(_items[1].price).to.equal(ticket_2[0].price)

            })

            it('should succeed removing a private ticket', async () => {

                await logic.addPrivateTicket(id, ticket_1)
                await logic.addPrivateTicket(id, ticket_2)


                const user = await User.findById(id).lean()
                const { tickets } = user

                let fTicketId = tickets[0]._id

                await logic.removePrivateTicket(id, fTicketId)

                const _user = await User.findById(id)

                const { tickets: _tickets } = _user

                expect(_tickets).to.have.lengthOf(1)
                expect(_tickets[0]._id.toString()).to.be.equal(tickets[1]._id.toString())

            })
            it('should succeed removing all private tickets', async () => {

                await logic.addPrivateTicket(id, ticket_1)
                await logic.addPrivateTicket(id, ticket_2)


                await logic.removeAllPrivateTickets(id)
                const _user = await User.findById(id)

                expect(_user.tickets).to.have.lengthOf(0)
            })

            it('should succeed retriving ticket by range of dates', async () => {


                let userId = "5cececc4c0b1c93f8c9b6e88"

                const tickets = await logic.retrivePrivateTicketsByDates(userId, { init: "2019/04/28", end: "2019/05/20" })

                debugger
                expect(tickets[0].date).to.equal("2019/04/28")
                expect(tickets[1].date).to.equal("2019/05/1")
                expect(tickets[2].date).to.equal("2019/05/20")

            })

            it('should succeed retriving ticket by a month', async () => {


                let userId = "5cececc4c0b1c93f8c9b6e88"

                const tickets = await logic.retrivePrivateTicketsByDates(userId, { month: "2019/04" })

                expect(tickets[0].month).to.equal("2019/04")


            })

            it('should succeed retriving ticket by a day', async () => {


                let userId = "5cececc4c0b1c93f8c9b6e88"

                const tickets = await logic.retrivePrivateTicketsByDates(userId, { day: "2019/04/28" })

                expect(tickets[0].date).to.equal("2019/04/28")


            })
        })
        describe("alerts", () => {

            let user
            let id
            let alert = { name: "platanos", value: 300 }

            beforeEach(async () => {
                user = await User.create({ name, surname, email, password })
                id = user.id
            })


            it('should succeed adding an alert', async () => {


                await logic.addAlert(id, alert)
                const _user = await User.findById(id).lean()
                const { alerts } = _user

                expect(alerts).to.exist
                expect(alerts).to.have.lengthOf(1)
                expect(alerts[0].name).to.equal(alert.name)

            })


            it('should succeed deleting an alert', async () => {


                await logic.addAlert(id, alert)
                await logic.addAlert(id, alert)

                const user = await User.findById(id).lean()
                const { alerts } = user

                let alertId = alerts[0]._id.toString()

                await logic.deleteAlert(id, alertId)

                const _user = await User.findById(id).lean()
                const { alerts: _alerts } = _user

                expect(_alerts).to.exist
                expect(_alerts).to.have.lengthOf(1)
                expect(_alerts[0].name).to.equal(alert.name)

            })

            it('should succeed editing an alert', async () => {


                await logic.addAlert(id, alert)

                const user = await User.findById(id).lean()
                const { alerts } = user

                let alertId = alerts[0]._id.toString()

                let data = { name: "PINCHOS" }

                await logic.editAlert(id, alertId, data)

                const _user = await User.findById(id).lean()
                const { alerts: _alerts } = _user

                expect(_alerts).to.exist
                expect(_alerts).to.have.lengthOf(1)
                expect(_alerts[0].name).to.equal(data.name)

            })



        })


    })



    after(() => mongoose.disconnect())


})