import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Post } from "~/models/post.server";
import { getPostBySlug } from "~/models/post.server";
import { marked } from "marked";

type LoaderData = { post: Post; html: string };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPostBySlug(params.slug);
  invariant(post, `post not found: ${params.slug}`);

  const html = marked(post.markdown_content);
  return json<LoaderData>({ post, html });
};

export default function PostSlug() {
  const { post, html } = useLoaderData();
  return (
    <main className="mx-auto max-w-4xl">
      <main className="mx-auto max-w-4xl">
        <h1 className="my-6 border-b-2 text-center text-3xl">
          {post.title}
        </h1>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </main>
  );
}