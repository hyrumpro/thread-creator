import { MainLayout } from "@/components/layout/MainLayout";
import { TweetFeed } from "@/components/tweet/TweetFeed";
import { useTweets } from "@/context/TweetContext";
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { users } from "@/data/mockData";
import { useState } from "react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { User } from "@/types/tweet";

const Profile = () => {
  const { username } = useParams();
  const { tweets, currentUser, updateProfile } = useTweets();
  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "media" | "likes">("posts");
  const [showEditModal, setShowEditModal] = useState(false);

  // Find user by username or default to current user
  const user = username
    ? users.find((u) => u.username === username) || currentUser
    : currentUser;

  // Use currentUser data if viewing own profile (for real-time updates)
  const displayUser = (!username || user.id === currentUser.id) ? currentUser : user;

  const userTweets = tweets.filter((tweet) => tweet.author.id === displayUser.id);
  const isOwnProfile = displayUser.id === currentUser.id;

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "replies", label: "Replies" },
    { id: "media", label: "Media" },
    { id: "likes", label: "Likes" },
  ] as const;

  const handleSaveProfile = (updates: Partial<User>) => {
    updateProfile(updates);
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6 p-4">
          <Link to="/" className="p-2 -m-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-1">
              {displayUser.displayName}
              {displayUser.isVerified && (
                <svg viewBox="0 0 22 22" className="w-5 h-5 fill-primary">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">{userTweets.length} posts</p>
          </div>
        </div>
      </header>

      {/* Cover Image with gradient fallback */}
      <div className="h-52 relative overflow-hidden">
        {displayUser.coverImage ? (
          <img
            src={displayUser.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-end -mt-16 mb-4">
          <div className="relative">
            <img
              src={displayUser.avatar}
              alt={displayUser.displayName}
              className="w-32 h-32 rounded-full border-4 border-background object-cover"
            />
            {displayUser.isPro && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <svg viewBox="0 0 22 22" className="w-3.5 h-3.5 fill-primary-foreground">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              </div>
            )}
          </div>
          {isOwnProfile ? (
            <Button
              variant="outline"
              className="rounded-full font-bold hover:bg-foreground/10"
              onClick={() => setShowEditModal(true)}
            >
              Edit profile
            </Button>
          ) : (
            <Button className="rounded-full font-bold">
              Follow
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-1">
              {displayUser.displayName}
              {displayUser.isVerified && (
                <svg viewBox="0 0 22 22" className="w-5 h-5 fill-primary">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              )}
            </h2>
            <p className="text-muted-foreground">@{displayUser.username}</p>
          </div>

          {displayUser.bio && <p className="whitespace-pre-wrap">{displayUser.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {displayUser.joinedDate}
            </span>
          </div>

          <div className="flex gap-4 text-sm">
            <Link to="#" className="hover:underline">
              <span className="font-bold text-foreground">{displayUser.following.toLocaleString()}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </Link>
            <Link to="#" className="hover:underline">
              <span className="font-bold text-foreground">{displayUser.followers.toLocaleString()}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 text-center font-medium transition-colors relative hover:bg-secondary ${
              activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tweets */}
      <TweetFeed
        tweets={userTweets}
        emptyMessage={isOwnProfile ? "You haven't posted anything yet." : "No posts to show."}
      />

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          user={currentUser}
          onSave={handleSaveProfile}
        />
      )}
    </MainLayout>
  );
};

export default Profile;
