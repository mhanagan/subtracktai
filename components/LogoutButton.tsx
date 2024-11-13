import { signOut } from "next-auth/react"

const LogoutButton = () => {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  )
}

export default LogoutButton 