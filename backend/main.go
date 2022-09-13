package main

import (
	"errors"
	"strings"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/google/uuid"
)

var ErrPostNotFound = errors.New("post not found")

type Post struct {
	Slug            string `json:"slug"`
	Title           string `json:"title"`
	MarkdownContent string `json:"markdown_content"`
}

type PostDataStore struct {
	posts map[string]Post
	m     sync.RWMutex
}

func (b *PostDataStore) Save(post *Post) {
	b.m.Lock()
	defer b.m.Unlock()
	b.posts[post.Slug] = *post
}

func (b *PostDataStore) Get(slug string) (Post, error) {
	b.m.RLock()
	defer b.m.RUnlock()
	if blog, ok := b.posts[slug]; !ok {
		return blog, ErrPostNotFound
	}
	return b.posts[slug], nil
}

func (b *PostDataStore) GetAll() []Post {
	b.m.RLock()
	defer b.m.RUnlock()
	var posts []Post
	for _, post := range b.posts {
		posts = append(posts, post)
	}
	return posts
}

func main() {
	app := fiber.New()

	app.Use(cors.New())
	app.Use(logger.New())
	app.Use(recover.New())

	postsDataStore := &PostDataStore{
		posts: make(map[string]Post),
		m:     sync.RWMutex{},
	}

	app.Post("/api/posts", func(c *fiber.Ctx) error {
		post := new(Post)
		if err := c.BodyParser(post); err != nil {
			return err
		}
		post.Slug = textToSlug(post.Title) + "-" + uuid.NewString()
		postsDataStore.Save(post)
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"data": post,
		})
	})

	app.Get("/api/posts", func(c *fiber.Ctx) error {
		posts := postsDataStore.GetAll()
		if len(posts) == 0 {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "no posts found",
			})
		}

		return c.JSON(fiber.Map{
			"data": postsDataStore.GetAll(),
		})
	})

	app.Get("/api/posts/:slug", func(c *fiber.Ctx) error {
		id := c.Params("slug")
		post, err := postsDataStore.Get(id)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": ErrPostNotFound.Error(),
			})
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"data": post,
		})
	})

	app.Listen(":9090")
}

func textToSlug(text string) string {
	return strings.ToLower(strings.ReplaceAll(text, " ", "-"))
}
