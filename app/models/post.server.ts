import { json } from "@remix-run/node";

export type Post = {
  slug: string;
  title: string;
  markdown_content: string;
};

export async function getPosts(): Promise<Array<Post>> {
  const res = await fetch("http://localhost:9090/api/posts")
  const posts = await res.json()
  if (posts.error) {
    return []
  }
  return posts.data
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const res = await fetch("http://localhost:9090/api/posts/" + slug)
  const post = await res.json()
  return post.data
}

export async function createPost(
  post: { title: string | null; markdown_content: string | null }
) {
  await fetch("http://localhost:9090/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  })
}