import * as z from "zod";
// import { tinNoInfo } from "./action";

const required_error = "Required Field"
const minPasswordLength = 8

export function validatePhoneNumber(phone: string): string | null {
  const digits = phone.replace(/[\s-]/g, "");
  if (/^(0[79][0-9]{8}|\+2510?[79][0-9]{8})$/.test(digits)) return null;
  return "Enter a valid Ethiopian phone number (e.g. +251 9XX XXX XXX or 07XX XXX XXX)";
}

export function validateStrongPassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be 128 characters or fewer";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
  return null;
}

const strongPassword = z.string().min(1, { message: required_error }).superRefine((val, ctx) => {
  const error = validateStrongPassword(val);
  if (error) {
    ctx.addIssue({ code: "custom", message: error });
  }
});

export const signUpFormSchema = z.object({
	firstName: z.string().min(1, { message: required_error }),
	lastName: z.string().min(1, { message: required_error }),
	email: z.string().min(1, { message: required_error }).email({ message: "Invalid email address" }),
	phoneNumber: z.string().min(1, { message: required_error }).superRefine((val, ctx) => {
	  const error = validatePhoneNumber(val);
	  if (error) ctx.addIssue({ code: "custom", message: error });
	}),
	role: z.enum(["USER", "ECOSYSTEM_BUILDER"], { 
		required_error: "Please select a role",
		invalid_type_error: "Please select a valid role"
	}),
	password: strongPassword,
	confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine(data => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});

export const signInFormSchema = z.object({
	email: z.string().min(1, { message: "Email is required." }).email({ message: "Please enter a valid email address." }),
	password: z.string().min(minPasswordLength, { message: `Password must be at least ${minPasswordLength} characters.` }),
});

// onboarding
export const industry = [
	"Tech",
	"Finance",
	"Health",
	"Retail",
	"Other"
]

export const companyDetailsFormSchema = z.object({
	startupName: z.string().min(1, { message: required_error }),
	// numberOfFounders: z.coerce.number({ message: required_error }).int().min(1, { message: "Can't be less than 1" }),
	numberOfEmployees: z.coerce.number({ message: required_error }).int().min(1, { message: "Can't be less than 1" }),
	foundingDate: z.coerce.date(),
	industry: z.enum(["Tech", "Finance", "Health", "Retail", "Other"]),
	website: z.string().optional(),
	phoneNumber: z.string().min(10, { message: "Invalid phone number" }),
	email: z.string().email(),
	alternateEmail: z.string().email().optional(),
	businessLicense: z.unknown().transform(value => {
    return value as unknown
  }), // .refine(data => data && data.length > 0, 'File is required'),
	articleOfIncorporation: z.unknown().transform(value => {
    return value as unknown
  }), // .refine(data => data && data.length > 0, 'File is required'),
	tin: z.string().optional(),
})


export const founderSchema = z.object({
	fullName: z.string().min(3, { message: required_error }),
	noOfShares: z.coerce.number({ message: required_error }).int().min(1, { message: "Can't be less than 1" }),
	fcn: z.string().min(1).optional(),
})

export const founderDetailsFormSchema = z.object({
	founders: z.array(founderSchema),
	totalShares: z.coerce.number({ message: required_error }).int().min(1, { message: "Can't be less than 1" }),
	sharePrice: z.coerce.number({ message: required_error }).min(1, { message: "Can't be less than 1" }),
})

export const visionMissionFormSchema = z.object({
	vision: z.string().min(1, { message: required_error }),
	mission: z.string().min(1, { message: required_error }),
})

export const productDetailsFormSchema = z.object({
	productDescription: z.string().min(1, { message: required_error }),
	uniqueValue: z.string().min(1, { message: required_error }),
})

// dashboard
export const profileSettingsFormSchema = z.object({
	firstName: z.string().min(1, { message: required_error }),
	lastName: z.string().min(1, { message: required_error }),
	dateOfBirth: z.coerce.date(),
	phoneNumber: z.string().min(10, { message: "Invalid phone number" }),
	address: z.string().min(1, { message: required_error }),
	profilePicture: z.unknown().transform(value => {
		return value as unknown
	}), // .refine(data => data && data.length > 0, 'File is required'),
})

export const accountSettingFormSchema = z.object({
	email: z.string().email(),
	password: z.string().min(minPasswordLength),
	newPassword: z.string().min(minPasswordLength),
})

export const FormSchema = z.object({})