from pydantic import BaseModel, EmailStr
# from dotenv import load_dotenv

class SignupModel(BaseModel):
    full_name: str
    email: EmailStr
    organization: str
    password: str
    confirm_password: str

class LoginModel(BaseModel):
    email: EmailStr
    password: str
    two_factor_code: str | None = None

class UserResponse(BaseModel):
    full_name: str
    email: str
    organization: str