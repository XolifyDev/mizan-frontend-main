import React from 'react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'

type Props = {
  session: any 
}

const UserInfo = ({ session }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={session && session.user.image || null} />
        <AvatarFallback className="bg-[#550C18] text-[#FDF0D5]">
          {session && session.user?.name.split(" ")[0]?.charAt(0) + session.user?.name.split(" ")[1]?.charAt(0) || "Error"}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium text-[#3A3A3A]">{session && session.user.name || "Error"}</p>
        <p className="text-xs text-[#3A3A3A]/70">Admin</p>
      </div>
    </div>
  )
}

export default UserInfo
