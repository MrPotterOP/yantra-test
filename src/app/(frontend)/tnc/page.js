
import CTAbanner from "@/components/CTAbanner/CTAbanner";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/TnC/Header";
import Tnc from "@/components/TnC/TnC";


function Termsofsales() {
    return ( 
       <section>
          <Header />

          <main>
            <Tnc />
          </main>

          <CTAbanner />
          <Footer />
       </section>
     );
}

export default Termsofsales;