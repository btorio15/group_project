// ********************** Initialize server **********************************

const server = require('../src/views/index');

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************
// describe('Testing Register API', () => {
//   it('positive : /registeruser', done => {
//   const uniqueUser = `testuser_${Date.now()}`;  // unique every run
//   chai
//     .request(server)
//     .post('/registeruser')
//     .redirects(0)
//     .send({
//       username: uniqueUser,
//       email: `${uniqueUser}@gmail.com`,
//       password: 'labtenpwd'
//     })
//     .end((err, res) => {
//       expect(res).to.have.status(302);
//       expect(res.headers.location).to.equal('/login');
//       done();
//     });
// });

//   it('Negative : /registeruser. Checking no username', done => {
//     chai
//       .request(server)
//       .post('/registeruser')
//       .redirects(0)
//       .send({ email: 'lab10user@gmail.com', password: 'labtenpwd' })
//       .end((err, res) => {
//         expect(res).to.have.status(302);
//         expect(res.headers.location).to.equal('/register'); // where it redirects
//         done();
//       });
//   });
// });

// describe('Testing Login API', () => {
//   it('positive : /loginuser', done => {
//     chai
//       .request(server)
//       .post('/loginuser')
//       .redirects(0)
//       .send({
//         username: 'admin',
//         password: 'admin123'
//       })
//       .end((err, res) => {
//         expect(res).to.have.status(302); // redirect
//         expect(res.headers.location).to.equal('/home'); // where it redirects
//         done();
//       });
//   });

//   it('Negative : /loginuser. Checking no username', done => {
//   chai
//     .request(server)
//     .post('/loginuser')
//     .redirects(0)
//     .send({ username: 'userrrrr', password: 'labtenpwd' })
//     .end((err, res) => {
//       expect(res).to.have.status(200); // now renders page with inline errors, not a redirect
//       done();
//     });
//   });
// });