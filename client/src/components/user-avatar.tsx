import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  
  const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[charCode % colors.length];
}

export function UserAvatar({ name, className = "h-8 w-8" }: UserAvatarProps) {
  const initials = getInitials(name);
  const colorClass = getColorFromName(name);

  return (
    <Avatar className={className} data-testid={`avatar-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <AvatarFallback className={`${colorClass} text-white`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
