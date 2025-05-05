import { db } from "./index";
import { brands, vehicles, dealers, reviews, instagramPosts, sales } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Remova os dados existentes primeiro (WARNING: apenas para desenvolvimento)
    await db.delete(sales);
    await db.delete(vehicles);
    await db.delete(dealers);
    await db.delete(reviews);
    await db.delete(instagramPosts);
    await db.delete(brands);

    // Seed brands
    const brandsData = [
      { name: "BMW", logoUrl: "https://static.autoconf.com.br/marcas/bmw.png" },
      { name: "BYD", logoUrl: "https://static.autoconf.com.br/marcas/byd.png" },
      { name: "CHERY", logoUrl: "https://static.autoconf.com.br/marcas/chery.png" },
      { name: "Chevrolet", logoUrl: "https://static.autoconf.com.br/marcas/gm-chevrolet.png" },
      { name: "Citroën", logoUrl: "https://static.autoconf.com.br/marcas/citroen.png" },
      { name: "Fiat", logoUrl: "https://static.autoconf.com.br/marcas/fiat.png" },
      { name: "Ford", logoUrl: "https://static.autoconf.com.br/marcas/ford.png" },
      { name: "Honda", logoUrl: "https://static.autoconf.com.br/marcas/honda.png" },
      { name: "Hyundai", logoUrl: "https://static.autoconf.com.br/marcas/hyundai.png" },
      { name: "Jeep", logoUrl: "https://static.autoconf.com.br/marcas/jeep.png" },
      { name: "Nissan", logoUrl: "https://static.autoconf.com.br/marcas/nissan.png" },
      { name: "Peugeot", logoUrl: "https://static.autoconf.com.br/marcas/peugeot.png" },
      { name: "Renault", logoUrl: "https://static.autoconf.com.br/marcas/renault.png" },
      { name: "Toyota", logoUrl: "https://static.autoconf.com.br/marcas/toyota.png" },
      { name: "Volkswagen", logoUrl: "https://static.autoconf.com.br/marcas/vw-volkswagen.png" },
      { name: "YAMAHA", logoUrl: "https://static.autoconf.com.br/marcas/yamaha.png" },
    ];

    const insertedBrands = await db.insert(brands).values(brandsData).returning();
    console.log(`Inserted ${insertedBrands.length} brands`);

    // Create a map for easy brand lookup
    const brandMap = new Map();
    insertedBrands.forEach(brand => {
      brandMap.set(brand.name, brand.id);
    });

    // Seed vehicles
    const vehiclesData = [
      {
        brandId: brandMap.get("Volkswagen"),
        model: "Nivus Highline 1.0 200 TSI Flex Aut.",
        year: "2023/2024",
        color: "Cinza",
        price: "126900",
        originalPrice: "128900",
        mileage: 32183,
        description: "Volkswagen Nivus Highline 1.0 200 TSI Flex Aut. - Cinza - 2024",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
      },
      {
        brandId: brandMap.get("Volkswagen"),
        model: "Nivus Highline 1.0 200 TSI Flex Aut.",
        year: "2023/2024",
        color: "Branco",
        price: "126900",
        originalPrice: "128900",
        mileage: 49076,
        description: "Volkswagen Nivus Highline 1.0 200 TSI Flex Aut. - Branco - 2024",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1617814076668-11183bc12271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
      },
      {
        brandId: brandMap.get("Fiat"),
        model: "PULSE IMPETUS 1.0 TURBO 200 Flex Aut.",
        year: "2022/2022",
        color: "Branco",
        price: "106900",
        originalPrice: "109900",
        mileage: 34076,
        description: "PULSE IMPETUS 1.0 TURBO 200 Flex Aut.",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
      },
      {
        brandId: brandMap.get("Hyundai"),
        model: "HB20 Comfort Plus 1.0 TB Flex 12V Mec.",
        year: "2023/2023",
        color: "Prata",
        price: "87900",
        originalPrice: "89900",
        mileage: 15780,
        description: "HB20 Comfort Plus 1.0 TB Flex 12V Mec. - Prata - 2023",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
      },
      {
        brandId: brandMap.get("Ford"),
        model: "Ranger Limited 2.0 4x4 CD Aut.",
        year: "2022/2022",
        color: "Preto",
        price: "219900",
        originalPrice: "225900",
        mileage: 45230,
        description: "Ranger Limited 2.0 4x4 CD Aut.",
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80"
      },
      {
        brandId: brandMap.get("Toyota"),
        model: "Corolla Cross XRE 2.0 16V Flex Aut.",
        year: "2023/2023",
        color: "Vermelho",
        price: "178900",
        originalPrice: "182900",
        mileage: 22500,
        description: "Corolla Cross XRE 2.0 16V Flex Aut.",
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80"
      }
    ];

    const insertedVehicles = await db.insert(vehicles).values(vehiclesData).returning();
    console.log(`Inserted ${insertedVehicles.length} vehicles`);

    // Seed dealers
    const dealersData = [
      {
        name: "Caique Contarini",
        username: "caiquewm@gmail.com",
        password: "$2a$10$XExUbDSjHbpEYtU5DsVTE.WgQqH8gZxZRXcVxYLOFvD0QJlAzkGXK", // "102030"
        startDate: new Date("2021-01-01"),
        points: 200,
        sales: 45
      },
      {
        name: "Marcos Silva",
        username: "marcos",
        password: "$2a$10$XExUbDSjHbpEYtU5DsVTE.WgQqH8gZxZRXcVxYLOFvD0QJlAzkGXK", // "password"
        startDate: new Date("2022-04-01"),
        points: 142,
        sales: 32
      },
      {
        name: "Carolina Oliveira",
        username: "carolina",
        password: "$2a$10$XExUbDSjHbpEYtU5DsVTE.WgQqH8gZxZRXcVxYLOFvD0QJlAzkGXK", // "password"
        startDate: new Date("2023-01-01"),
        points: 124,
        sales: 28
      },
      {
        name: "Ricardo Santos",
        username: "ricardo",
        password: "$2a$10$XExUbDSjHbpEYtU5DsVTE.WgQqH8gZxZRXcVxYLOFvD0QJlAzkGXK", // "password"
        startDate: new Date("2021-05-01"),
        points: 108,
        sales: 25
      }
    ];

    const insertedDealers = await db.insert(dealers).values(dealersData).returning();
    console.log(`Inserted ${insertedDealers.length} dealers`);

    // Seed reviews
    const reviewsData = [
      {
        name: "João Almeida",
        avatarInitial: "J",
        rating: 5,
        comment: "Atendimento excelente! O vendedor foi muito atencioso e me ajudou a encontrar o carro perfeito para mim. Recomendo!"
      },
      {
        name: "Ana Paula",
        avatarInitial: "A",
        rating: 5,
        comment: "Comprei meu carro e estou super satisfeita. Processo rápido e sem burocracia. O financiamento foi aprovado no mesmo dia!"
      },
      {
        name: "Carlos Mendes",
        avatarInitial: "C",
        rating: 4,
        comment: "Ótima concessionária, bom atendimento e variedade de veículos. Só não dou 5 estrelas porque o café estava frio."
      }
    ];

    const insertedReviews = await db.insert(reviews).values(reviewsData).returning();
    console.log(`Inserted ${insertedReviews.length} reviews`);

    // Seed Instagram posts
    const instagramPostsData = [
      {
        imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 45,
        postUrl: "https://www.instagram.com/douglas.autocar/"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 32,
        postUrl: "https://www.instagram.com/douglas.autocar/"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 28,
        postUrl: "https://www.instagram.com/douglas.autocar/"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1617814076668-11183bc12271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 56,
        postUrl: "https://www.instagram.com/douglas.autocar/"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 41,
        postUrl: "https://www.instagram.com/douglas.autocar/"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
        likes: 37,
        postUrl: "https://www.instagram.com/douglas.autocar/"
      }
    ];

    const insertedInstagramPosts = await db.insert(instagramPosts).values(instagramPostsData).returning();
    console.log(`Inserted ${insertedInstagramPosts.length} Instagram posts`);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
