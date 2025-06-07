"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Reply } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckIcon, DotsHorizontalIcon, Cross2Icon } from "@radix-ui/react-icons"
import { AnnotatedImage } from "@/components/annotated-image"

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
    initials: string
  }
  content: string
  timestamp: string
  resolved: boolean
  replies: Comment[]
}

interface CommentThreadProps {
  comment: Comment
  onResolve: (id: string) => void
  onReply: (parentId: string, content: string) => void
  onDelete: (id: string) => void
}

function CommentThread({ comment, onResolve, onReply, onDelete }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent)
      setReplyContent("")
      setIsReplying(false)
    }
  }

  return (
    <Card className={`w-full ${comment.resolved ? "opacity-70 bg-gray-50" : "bg-white"} shadow-sm border border-gray-200`}>
      <CardContent className="p-4 space-y-4">
        {/* Main Comment */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-sm font-medium">{comment.author.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{comment.author.name}</span>
                <span className="text-xs text-gray-500">{comment.timestamp}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onResolve(comment.id)}>
                  {comment.resolved ? (
                    <>
                      <Cross2Icon className="h-4 w-4 mr-2" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Resolve
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm leading-relaxed text-gray-700 mt-3">{comment.content}</p>

          {comment.resolved && (
            <Badge variant="secondary" className="text-xs mt-2">
              <CheckIcon className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="space-y-3 ml-6 pl-4 border-l-2 border-gray-200 mt-4">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={reply.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{reply.author.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{reply.author.name}</span>
                    <span className="text-xs text-gray-500">{reply.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 ml-9">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Input */}
        {isReplying ? (
          <div className="space-y-3 ml-6 pl-4 border-l-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] text-sm border-blue-200 focus:border-blue-400"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply} className="bg-blue-600 hover:bg-blue-700">
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          !comment.resolved && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsReplying(true)} 
              className="h-8 text-sm mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}

export default function CommentsSystem({ src, name }: { src: string; name: string }) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SC",
      },
      content:
        "I think we should revise this section to be more concise. The current explanation might be too verbose for our target audience.",
      timestamp: "2 hours ago",
      resolved: false,
      replies: [
        {
          id: "1-1",
          author: {
            name: "Alex Johnson",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "AJ",
          },
          content: "Good point! I'll work on shortening it while keeping the key information.",
          timestamp: "1 hour ago",
          resolved: false,
          replies: [],
        },
      ],
    },
    {
      id: "2",
      author: {
        name: "Mike Rodriguez",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MR",
      },
      content: "The formatting looks great here. Nice work on the layout!",
      timestamp: "3 hours ago",
      resolved: true,
      replies: [],
    },
    {
      id: "3",
      author: {
        name: "Emily Davis",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "ED",
      },
      content:
        "Should we add more examples to illustrate this concept? I think it would help readers understand better.",
      timestamp: "4 hours ago",
      resolved: false,
      replies: [
        {
          id: "3-1",
          author: {
            name: "Sarah Chen",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "SC",
          },
          content: "I can provide a few real-world examples that would fit well here.",
          timestamp: "3 hours ago",
          resolved: false,
          replies: [],
        },
        {
          id: "3-2",
          author: {
            name: "Emily Davis",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "ED",
          },
          content: "Perfect! That would be really helpful.",
          timestamp: "3 hours ago",
          resolved: false,
          replies: [],
        },
      ],
    },
  ])

  const [newComment, setNewComment] = useState("")
  const [showNewComment, setShowNewComment] = useState(false)

  const handleResolve = (commentId: string) => {
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, resolved: !comment.resolved } : comment)),
    )
  }

  const handleReply = (parentId: string, content: string) => {
    const newReply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "YU",
      },
      content,
      timestamp: "Just now",
      resolved: false,
      replies: [],
    }

    setComments(
      comments.map((comment) =>
        comment.id === parentId ? { ...comment, replies: [...comment.replies, newReply] } : comment,
      ),
    )
  }

  const handleDelete = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId))
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          name: "You",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "YU",
        },
        content: newComment,
        timestamp: "Just now",
        resolved: false,
        replies: [],
      }
      setComments([comment, ...comments])
      setNewComment("")
      setShowNewComment(false)
    }
  }

  const unresolvedComments = comments.filter((c) => !c.resolved)
  const resolvedComments = comments.filter((c) => c.resolved)

  return (
    <div className="w-full h-screen p-6">
      <div className="flex gap-6 h-full">
        {/* Main Content Area - 85% */}
        <div className="w-[85%] pr-4">
          <div className="w-full h-full bg-gray-50 rounded-lg p-4">
            <AnnotatedImage src={src} alt={name} />
          </div>
        </div>

        {/* Comments Sidebar - 15% */}
        <div className="w-[15%] min-w-80 border-l border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Comments
            </h2>
            <Button 
              size="sm" 
              onClick={() => setShowNewComment(true)} 
            >
              Add Comment
            </Button>
          </div>
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 space-y-6">

              {/* New Comment Form */}
              {showNewComment && (
                <Card className="border-blue-200 shadow-sm flex-shrink-0">
                  <CardContent className="p-4 space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] border-blue-200 focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddComment}>
                        Comment
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewComment(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Content */}
              <div className="space-y-6">
                {/* Active Comments */}
                {unresolvedComments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Active ({unresolvedComments.length})
                    </h3>
                    <div className="space-y-4">
                      {unresolvedComments.map((comment) => (
                        <CommentThread
                          key={comment.id}
                          comment={comment}
                          onResolve={handleResolve}
                          onReply={handleReply}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolved Comments */}
                {resolvedComments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-600 border-b border-gray-200 pb-2">
                      Resolved ({resolvedComments.length})
                    </h3>
                    <div className="space-y-4">
                      {resolvedComments.map((comment) => (
                        <CommentThread
                          key={comment.id}
                          comment={comment}
                          onResolve={handleResolve}
                          onReply={handleReply}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {comments.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-base">No comments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Be the first to add a comment!</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
