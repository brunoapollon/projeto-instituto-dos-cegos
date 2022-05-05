const UserAuthenticationController = require('@controllers/UserAuthenticationController');
const UserController = require('@controllers/UserController');
const assistedRouter = require('@routes/assisted.routes');
const memberFamilyRouter = require('@routes/memberFamily.routes');
const userRouter = require('@routes/user.routes');
const { Router } = require('express');
const passport = require('passport');

const AuthenticationValidation = require('@middlewares/validations/AuthenticationValidation');
const CreateUserValidation = require('@middlewares/validations/CreateUserValidation');
const SchemaPassport = require('@middlewares/Auth');

const routes = new Router();

routes.post(
  '/authentication',
  AuthenticationValidation,
  UserAuthenticationController.store,
);
userRouter.post('/user', CreateUserValidation, UserController.store);

passport.use(SchemaPassport);
routes.use(passport.authenticate('jwt', { session: false }));

routes.use('/user', userRouter);
routes.use('/assisted', assistedRouter);
routes.use('/memberfamily', memberFamilyRouter);

module.exports = routes;
