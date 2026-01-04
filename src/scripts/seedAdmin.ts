import { email } from "better-auth/*";
import { UserRole } from "../lib/middlewares/auth";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
    try {
        // Check if admin user already exists in the db
        const adminData = {
            name: process.env.ADMIN_NAME || "Admin User",
            email: process.env.ADMIN_EMAIL || "admin@admin.com",
            role: UserRole.Admin,
            password: process.env.ADMIN_PASSWORD || "admin123",
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email,
            },
        });

        if (existingUser) {
            console.log("Admin user already exists. Skipping admin creation.");
        }
        const signUpAdmin = await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(adminData),
        })

        console.log("Admin user created successfully:", signUpAdmin);
        // admin created but email not verified
        if (signUpAdmin.ok) {
            //verify admin email
            const verifyAdminEmail = await prisma.user.update({
                where: { email: adminData.email },
                data: {
                    emailVerified: true,
                }
            });
            console.log("Admin email verified:", verifyAdminEmail);
        }

    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
}

seedAdmin();