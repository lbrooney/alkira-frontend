import { describe, expect, it } from 'vitest'

import {
  MIN_PASSWORD_LENGTH,
  validateLogin,
  validateOtp,
  validateSignup,
} from './validation'

describe('validateLogin', () => {
  it('accepts a well-formed email and password', () => {
    expect(
      validateLogin({ email: 'admin@alkira.com', password: 'Alkira#2024' }),
    ).toEqual({})
  })

  it('requires both fields', () => {
    const errors = validateLogin({ email: '', password: '' })
    expect(errors.email).toBe('Email is required.')
    expect(errors.password).toBe('Password is required.')
  })

  it.each([
    'admin',
    'admin@',
    '@alkira.com',
    'admin@alkira',
    'admin @alkira.com',
  ])('rejects %j as an email', (email) => {
    expect(validateLogin({ email, password: 'Alkira#2024' }).email).toMatch(
      /valid email address/,
    )
  })

  it('ignores surrounding whitespace on the email', () => {
    expect(
      validateLogin({ email: '  admin@alkira.com  ', password: 'Alkira#2024' })
        .email,
    ).toBeUndefined()
  })

  it(`rejects passwords shorter than ${MIN_PASSWORD_LENGTH} characters`, () => {
    expect(
      validateLogin({ email: 'admin@alkira.com', password: 'short' }).password,
    ).toMatch(/at least 8 characters/)
  })

  it('does not apply composition rules at sign-in', () => {
    expect(
      validateLogin({ email: 'admin@alkira.com', password: 'alllowercase' }),
    ).toEqual({})
  })
})

describe('validateSignup', () => {
  const valid = {
    name: 'Ada Okonkwo',
    company: 'Northwind Logistics',
    email: 'ada@northwind.com',
    password: 'Alkira2024',
    confirmPassword: 'Alkira2024',
  }

  it('accepts a complete form', () => {
    expect(validateSignup(valid)).toEqual({})
  })

  it('requires name and company', () => {
    const errors = validateSignup({ ...valid, name: ' ', company: '' })
    expect(errors.name).toBe('Full name is required.')
    expect(errors.company).toBe('Company is required.')
  })

  it('enforces mixed case', () => {
    expect(
      validateSignup({
        ...valid,
        password: 'alkira2024',
        confirmPassword: 'alkira2024',
      }).password,
    ).toMatch(/uppercase and lowercase/)
  })

  it('enforces a digit', () => {
    expect(
      validateSignup({
        ...valid,
        password: 'AlkiraPass',
        confirmPassword: 'AlkiraPass',
      }).password,
    ).toMatch(/at least one number/)
  })

  it('reports a mismatched confirmation', () => {
    expect(
      validateSignup({ ...valid, confirmPassword: 'Alkira2025' })
        .confirmPassword,
    ).toBe('Passwords do not match.')
  })

  it('reports the length problem before the composition problem', () => {
    expect(
      validateSignup({ ...valid, password: 'aB1', confirmPassword: 'aB1' })
        .password,
    ).toMatch(/at least 8 characters/)
  })
})

describe('validateOtp', () => {
  it('accepts a code of the expected length', () => {
    expect(validateOtp('123456', 6)).toEqual({})
  })

  it('requires a value', () => {
    expect(validateOtp('   ', 6).code).toBe('Enter the verification code.')
  })

  it('rejects non-numeric characters', () => {
    expect(validateOtp('12a456', 6).code).toMatch(/numbers only/)
  })

  it('rejects the wrong number of digits', () => {
    expect(validateOtp('1234', 6).code).toBe(
      'The verification code is 6 digits.',
    )
  })
})
