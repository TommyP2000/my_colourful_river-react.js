// Verify if email field is empty or contains correct characters

const isEmail = (avatarEmail) => {
  // eslint-disable-next-line no-useless-escape
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (avatarEmail.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
};

// Validate Avatar name, email and password whether empty and authorise the Avatar registration

exports.validateRegisterData = (registerData) => {
  const registerErrors = {};
  if (isEmpty(registerData.avatarName))
    registerErrors.avatarName = 'This name must not be empty';
  if (isEmpty(registerData.avatarEmail)) {
    registerErrors.avatarEmail = 'This email must not be empty';
  } else if (!isEmail(registerData.avatarEmail)) {
    registerErrors.avatarEmail = 'This email must be a valid email address';
  }
  if (isEmpty(registerData.avatarPassword))
    registerErrors.avatarPassword = 'This password must not be empty';
  if (registerData.avatarPassword !== registerData.confirmAvatarPassword)
    registerErrors.confirmAvatarPassword = 'These passwords must match';
  return {
    registerErrors,
    valid: Object.keys(registerErrors).length === 0 ? true : false,
  };
};

// Validate Avatar email and password whether empty and authorise the Avatar login

exports.validateLoginData = (loginData) => {
  let loginErrors = {};
  if (isEmpty(loginData.avatarEmail))
    loginErrors.avatarEmail = 'This email must not be empty';
  if (isEmpty(loginData.avatarPassword))
    loginErrors.avatarPassword = 'This password must not be empty';
  return {
    loginErrors,
    valid: Object.keys(loginErrors).length === 0 ? true : false,
  };
};
