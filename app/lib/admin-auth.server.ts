import { AuthClient } from "@supabase/supabase-js"
import { createCookie, data, redirect } from "react-router"

const adminCookie = createCookie("rocola_admin", {
  httpOnly: true,
  sameSite: "lax",
  secure: import.meta.env.PROD,
  path: "/",
})

const privateHeaders = { "Cache-Control": "private, no-store" }

function createAdminAuth() {
  return new AuthClient({
    url: new URL("/auth/v1", import.meta.env.VITE_SUPABASE_URL).href,
    headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  })
}

export async function loadAdmin(request: Request) {
  const token = await adminCookie.parse(request.headers.get("Cookie"))
  if (typeof token !== "string") return data({ admin: null }, { headers: privateHeaders })

  const { data: { user } } = await createAdminAuth().getUser(token)
  const admin = user?.app_metadata.role === "system_admin" && user.email
    ? { email: user.email }
    : null

  return data({ admin }, { headers: privateHeaders })
}

export async function handleAdminLogin(request: Request) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    throw new Response("Origen no permitido", { status: 403 })
  }

  const form = await request.formData()
  if (form.get("intent") === "logout") {
    return redirect("/", {
      status: 303,
      headers: { ...privateHeaders, "Set-Cookie": await adminCookie.serialize("", { maxAge: 0 }) },
    })
  }

  const email = form.get("email")
  const password = form.get("password")
  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return data({ error: "Escribe tu correo y tu contraseña." }, {
      status: 400,
      headers: privateHeaders,
    })
  }

  const { data: { session, user } } = await createAdminAuth().signInWithPassword({
    email: email.trim(),
    password,
  })

  if (!session || user?.app_metadata.role !== "system_admin") {
    return data({ error: "No se pudo iniciar sesión. Revisa tus credenciales y tu acceso de administrador." }, {
      status: 401,
      headers: privateHeaders,
    })
  }

  return redirect("/", {
    status: 303,
    headers: {
      ...privateHeaders,
      "Set-Cookie": await adminCookie.serialize(session.access_token, { maxAge: session.expires_in }),
    },
  })
}
