import bcrypt from "bcrypt"
import validator from "validator"

const hashPassword = (password) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
};

// const validateUsername = (username) => {
//   // Regular expression to match valid characters in username
//   const regex = /^[a-zA-Z0-9_]+$/;

//   // Check if the username matches the regular expression
//   if (!regex.test(username)) {
//       return false; // Invalid username
//   }

//   return true; // Valid username
// };


function validateEmail(email) {
  
  return validator.isEmail(email);
}



const validatePassword = (password) => {
  const uppercaseRegex = /[A-Z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  if (
    password.length < 8 ||
    !uppercaseRegex.test(password) ||
    !numberRegex.test(password) ||
    !specialCharRegex.test(password)
  ) {
    // return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.' });

    return false;
  }

  return true;
};

function generateRandomPassword() {
  const length = 8; // Minimum length of password
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?'; // Characters allowed in password
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

export {validatePassword,hashPassword,generateRandomPassword,validateEmail} ;
