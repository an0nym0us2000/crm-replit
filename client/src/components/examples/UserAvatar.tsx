import { UserAvatar } from "../user-avatar";

export default function UserAvatarExample() {
  return (
    <div className="p-8">
      <div className="flex flex-wrap gap-4">
        <UserAvatar name="John Doe" />
        <UserAvatar name="Sarah Smith" />
        <UserAvatar name="Mike Johnson" />
        <UserAvatar name="Emily Davis" className="h-12 w-12" />
      </div>
    </div>
  );
}
