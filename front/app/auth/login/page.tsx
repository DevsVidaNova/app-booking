"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Checkbox, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { AuthService } from "@/services/auth.service";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [session, setsession] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await AuthService.login(email, password, session);
      toast.success("Login efetuado com sucesso.");
      setTimeout(() => {
        if (res?.user.role == "ADMIN") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      }, 1500);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/554792039515", "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center bg-background w-full h-screen">
      <Card className="w-[350px] self-center border-none shadow-none">
        <CardHeader>
          <Link href="/" className="w-full items-center self-center mx-auto flex flex-col justify-center">
            <Image priority src="/imgs/logo_black.png" width={220} height={70} alt="logo black" className="w-[220px] h-[70px] bg-gray self-center items-center" />
          </Link>
          <CardTitle className="text-2xl hidden">Entrar</CardTitle>
          <CardDescription className="hidden">Digite seu email e senha para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input id="email" placeholder="Ex.: email@exemplo.com" label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Input id="password" label="Senha" placeholder="Ex.: ********" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>
          </form>
          <div className="align-start flex space-x-2 mt-4">
            <Checkbox onClick={() => setsession(!session)} id="terms1" />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms1" className="text-sm font-medium text-primary opacity-70 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-1.5">
                Manter conectado
              </label>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? "Enviando" : "Entrar"}
          </Button>
          <Button onClick={handleWhatsApp} variant="secondary" className="w-full mt-4">
            Solicitar acesso
          </Button>
        </div>
      </Card>
    </div>
  );
}
