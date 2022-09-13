import { createPost } from "~/models/post.server";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";

type ActionData =
  | {
  title: null | string;
  markdown_content: null | string;
}
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const markdown_content = formData.get("markdown_content");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    markdown_content: markdown_content ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some(
    (errorMessage) => errorMessage
  );
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(
    typeof title === "string",
    "title must be a string"
  );
  invariant(
    typeof markdown_content === "string",
    "markdown must be a string"
  );

  await createPost({ title, markdown_content });

  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPost() {
  const errors = useActionData();

  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <Form method="post">
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input type="text" name="title" className={inputClassName} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown_content">
          Markdown:{" "}
          {errors?.markdown_content ? (
            <em className="text-red-600">
              {errors.markdown_content}
            </em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown_content"
          rows={20}
          name="markdown_content"
          className={`${inputClassName} font-mono`}
        />
      </p>

      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Post"}
        </button>
      </p>
    </Form>
  );

}