"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
    <Card className={`w-80 ${comment.resolved ? "opacity-60" : ""}`}>
      <CardContent className="p-4 space-y-3">
        {/* Main Comment */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{comment.author.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <DotsHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onResolve(comment.id)}>
                  {comment.resolved ? (
                    <>
                      <Cross2Icon className="h-3 w-3 mr-2" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-3 w-3 mr-2" />
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

          <p className="text-sm leading-relaxed">{comment.content}</p>

          {comment.resolved && (
            <Badge variant="secondary" className="text-xs">
              <CheckIcon className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={reply.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{reply.author.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{reply.author.name}</span>
                  <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed pl-7">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Input */}
        {isReplying ? (
          <div className="space-y-2 pl-4">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply}>
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          !comment.resolved && (
            <Button variant="ghost" size="sm" onClick={() => setIsReplying(true)} className="h-7 text-xs">
              <Reply className="h-3 w-3 mr-1" />
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-8">
        {/* Main Content Area */}
        <div className="flex-1">
          <div className="w-full h-full">
            <AnnotatedImage src={src} alt={name} />
          </div>
        </div>

        {/* Comments Sidebar */}
        <div className="w-96 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
            </h2>
            <Button size="sm" onClick={() => setShowNewComment(true)} className="h-8">
              Add Comment
            </Button>
          </div>

          {/* New Comment Form */}
          {showNewComment && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
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

          {/* Active Comments */}
          {unresolvedComments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Active ({unresolvedComments.length})</h3>
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
          )}

          {/* Resolved Comments */}
          {resolvedComments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Resolved ({resolvedComments.length})</h3>
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
          )}

          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
