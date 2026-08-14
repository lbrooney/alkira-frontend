export type FieldErrors<TField extends string> = Partial<Record<TField, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const MIN_PASSWORD_LENGTH = 8

export type LoginField = 'email' | 'password'

export interface LoginValues {
  email: string
  password: string
}

export function validateLogin(values: LoginValues): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {}

  const email = values.email.trim()
  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address, for example name@company.com.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  return errors
}

export type SignupField =
  | 'name'
  | 'company'
  | 'email'
  | 'password'
  | 'confirmPassword'

export interface SignupValues {
  name: string
  company: string
  email: string
  password: string
  confirmPassword: string
}

export function validateSignup(values: SignupValues): FieldErrors<SignupField> {
  const errors: FieldErrors<SignupField> = {}

  if (!values.name.trim()) {
    errors.name = 'Full name is required.'
  } else if (values.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.'
  }

  if (!values.company.trim()) {
    errors.company = 'Company is required.'
  }

  const email = values.email.trim()
  if (!email) {
    errors.email = 'Work email is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address, for example name@company.com.'
  }

  const password = values.password
  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    errors.password =
      'Password must include both uppercase and lowercase letters.'
  } else if (!/\d/.test(password)) {
    errors.password = 'Password must include at least one number.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export type OtpField = 'code'

export function validateOtp(
  code: string,
  digits: number,
): FieldErrors<OtpField> {
  const errors: FieldErrors<OtpField> = {}
  const trimmed = code.trim()

  if (!trimmed) {
    errors.code = 'Enter the verification code.'
  } else if (!/^\d+$/.test(trimmed)) {
    errors.code = 'The verification code contains numbers only.'
  } else if (trimmed.length !== digits) {
    errors.code = `The verification code is ${digits} digits.`
  }

  return errors
}
