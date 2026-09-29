import Header from "@/components/Contact/Header";
import Numbers from "@/components/Numbers/Numbers";
import Story from "@/components/Story/Story";
import WhyUs from "@/components/WhyUs/WhyUs";
import WorkLocations from "@/components/WorkLocations/WorkLocations";
import Advantages from "@/components/Advantages/Advantages";
import Footer from "@/components/Footer/Footer";
import CTAbanner from "@/components/CTAbanner/CTAbanner";
import Team from "@/components/Team/Team";



export const metadata = {
    title: "Yantra - About Us",
    description: "Contact Yantra for inquiries, feedback, or any questions related to our products or any other related matters. We're here to help you bring your vision to life. Reach out to us with your questions, suggestions, or just to say hello."
}


export default function About() {
    return (
        <main>
            <Header
                title="About Yantra Windows"
                description="Mumbai's Skylight, Window & Door Specialists Installing Across India"
                bg="/images/sky1.jpg"
            />
            <Numbers />
            <Story />
            <WorkLocations />
            <WhyUs />
            <Advantages />
            <Team />
            <CTAbanner />
            <Footer />
        </main>
    )
}