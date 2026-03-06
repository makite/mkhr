import { LoginForm } from "@/components/login/login-form";

const LoginPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
