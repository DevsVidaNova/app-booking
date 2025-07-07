import supabase from "@/config/supabaseClient";
import { UserProfile, CreateUserInput, UpdateUserInput, ResetPasswordInput } from "./types";

type HandlerResult<T> = { data?: T; error?: string };

export async function showUserHandler(id: string): Promise<HandlerResult<UserProfile & { total_bookings: number }>> {
  const outputs = "id, name, phone, role, user_id, email";
  let query = supabase.from("user_profiles").select(outputs);
  const { data: user, error } = await query.eq("id", id).single();
  if (error || !user) {
    return { error: "Usuário não encontrado" };
  }
  
  // Contar total de bookings do usuário
  const { count: totalBookings, error: countError } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id); // user_id é o id do usuário na tabela de bookings
  
  if (countError) {
    console.error("Erro ao contar bookings:", countError);
    return { data: { ...user, total_bookings: 0 } };
  }
  
  return { data: { ...user, total_bookings: totalBookings || 0 } };
}

export async function listUsersHandler(page = 1, limit = 10): Promise<HandlerResult<{ data: UserProfile[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>> {
  const outputs = "id, name, phone, role, user_id, email";
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await supabase
    .from("user_profiles")
    .select(outputs, { count: "exact", head: false })
    .range(from, to);
  if (error) {
    return { error: "Erro ao buscar usuários." };
  }
  const totalPages = Math.ceil((count || 0) / limit);
  return {
    data: {
      data: data || [],
      total: count || 0,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

export async function deleteUserHandler(userId: string): Promise<HandlerResult<null>> {
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
    
  if (!existingUser) {
    return { error: 'Usuário não encontrado.' };
  }
  
  // Excluir todos os bookings do usuário em cascata
  const { error: bookingsError } = await supabase
    .from('bookings')
    .delete()
    .eq('user_id', userId);
  
  if (bookingsError) {
    console.error('Erro ao excluir bookings do usuário:', bookingsError);
    return { error: `Erro ao excluir reservas do usuário: ${bookingsError.message}` };
  }
  
  // Excluir o perfil do usuário
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);
  if (profileError) {
    return { error: profileError.message };
  }
  
  // Excluir o usuário da autenticação
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    return { error: authError.message };
  }
  
  return { data: null };
}

export async function updateUserHandler(input: UpdateUserInput): Promise<HandlerResult<UserProfile>> {
  const { userId, name, phone, email, role } = input;
  
  // Verificar se o usuário existe
  const { data: user, error: fetchError } = await supabase
    .from("user_profiles")
    .select("name, phone, email, role")
    .eq("user_id", userId)
    .single();
  if (fetchError || !user) {
    return { error: "Usuário não encontrado." };
  }
  
  // Se está atualizando o e-mail, verificar se não existe outro usuário com o mesmo e-mail
  if (email && email !== user.email) {
    const { data: userWithSameEmail } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .neq("user_id", userId)
      .single();
      
    if (userWithSameEmail) {
      return { error: "Já existe um usuário com este e-mail." };
    }
  }
  
  const updates = {
    name: name ?? user.name,
    phone: phone ?? user.phone,
    email: email ?? user.email,
    role: role ?? user.role,
    updated_at: new Date(),
  };
  const { data: updated, error: updateError } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();
  if (updateError) {
    return { error: updateError.message };
  }
  return { data: updated };
}

export async function createUserHandler(input: CreateUserInput): Promise<HandlerResult<UserProfile>> {
  const { name, phone, role, password, email } = input;
  
  // Verificar se já existe um usuário com o mesmo e-mail
  const { data: existingUser } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("email", email)
    .single();
    
  if (existingUser) {
    return { error: "Já existe um usuário com este e-mail." };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        role: role || "user",
      },
    },
  });
  if (error || !data?.user) {
    return { error: error?.message || "Erro ao criar usuário." };
  }
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .insert({ user_id: data.user.id, name, phone, email, role: role || "user" })
    .select()
    .single();
  if (profileError) {
    return { error: profileError.message || "Erro ao criar perfil." };
  }
  return { data: profile };
}

export async function resetUserPasswordHandler(input: ResetPasswordInput): Promise<HandlerResult<{ message: string }>> {
  const { userId, defaultPassword = "123456" } = input;
  
  // Verificar se o usuário existe
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('id, email, name')
    .eq('user_id', userId)
    .single();
    
  if (!existingUser) {
    return { error: 'Usuário não encontrado.' };
  }
  
  // Resetar a senha usando a Admin API do Supabase
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: defaultPassword
  });
  
  if (updateError) {
    return { error: `Erro ao resetar senha: ${updateError.message}` };
  }
  
  return { 
    data: { 
      message: `Senha resetada com sucesso para o usuário ${existingUser.name}. Nova senha: ${defaultPassword}` 
    } 
  };
}

export async function listUsersScaleHandler(): Promise<HandlerResult<UserProfile[]>> {
  const outputs = "id, name, phone, role, user_id, email";
  const { data: users, error } = await supabase
    .from("user_profiles")
    .select(outputs);
  if (error) {
    return { error: "Erro ao buscar usuários." };
  }
  return { data: users || [] };
}
