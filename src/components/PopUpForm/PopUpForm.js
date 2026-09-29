// 'use client';
// import styles from './styles.module.css';

// import Image from 'next/image';

// import { useState, useEffect } from 'react';


// import submitJson from "submitjson";



// function PopUpForm() {

//     const [isOpen, setIsOpen] = useState(false);


//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setIsOpen(true);
//         }, 7000);

//         return () => clearTimeout(timer);

//     }, []);


    
    


//     const sj = new submitJson({
//         apiKey: process.env.NEXT_PUBLIC_SUBMIT_JSON_KEY,
//         endpoint: process.env.NEXT_PUBLIC_SUBMIT_JSON_ENDPOINT
//     });

//     const [formErrors, setFormErrors] = useState({});
//     const [formData, setFormData] = useState({
//         name: '',
//         mobile: '',
//         email: '',
//         state: '',
//         role: '',
//         requirement: ''
//     });
//     const [submitStatus, setSubmitStatus] = useState({
//         show: false,
//         success: false,
//         loading: false,
//         message: ''
//     });

//     const validateInput = (field, value) => {
//         let error = '';
//         switch (field) {
//             case 'name':
//                 if (!value.trim()) error = "Name is required.";
//                 break;
//             case 'mobile':
//                 if (!/^\d{10}$/.test(value)) error = "Mobile number should be 10 digits long.";
//                 break;
//             case 'email':
//                 if (!/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = "Invalid email address.";
//                 break;
//             case 'state':
//                 if (value === 'Select State') error = "Please select a valid state.";
//                 break;
//             case 'role':
//                 if (value === 'Select Role') error = "Please select a valid role.";
//                 break;
//             case 'requirement':
//                 if (value === 'Select Requirement') error = "Please select a valid requirement.";
//                 break;
//             default:
//                 break;
//         }
//         setFormErrors((prev) => ({ ...prev, [field]: error }));
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         validateInput(name, value);
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         // Validate all inputs before submission
//         Object.keys(formData).forEach((key) => validateInput(key, formData[key]));

//         // Check if there are any errors
//         const hasErrors = Object.values(formErrors).some((error) => error !== '');

//         if (!hasErrors) {
//             // Set loading state
//             setSubmitStatus({
//                 show: true,
//                 success: false,
//                 loading: true,
//                 message: 'Submitting your enquiry...'
//             });

//             console.log("Form data ready for submission:", formData);

//             // Submit the form data using the submitJson instance
//             sj.submit(formData)
//                 .then((response) => {
//                     if (response.data){
//                         console.log("Form submitted successfully:", response);
//                         setSubmitStatus({
//                             show: true,
//                             success: true,
//                             loading: false,
//                             message: 'Your enquiry has been submitted successfully!'
//                         });
                        
//                     }else {
//                         console.error("Error submitting form:");
//                         setSubmitStatus({
//                             show: true,
//                             success: false,
//                             loading: false,
//                             message: 'Failed to submit enquiry. Please try again. or just sent your querry at sales@yantraindia.com'
//                         });

//                     }
                    
//                     // Reset form after successful submission
//                     setFormData({
//                         name: '',
//                         mobile: '',
//                         email: '',
//                         state: '',
//                         role: '',
//                         requirement: ''
//                     });
//                 })
//                 .catch((error) => {
//                     console.error("Error submitting form:", error);
//                     setSubmitStatus({
//                         show: true,
//                         success: false,
//                         loading: false,
//                         message: 'Failed to submit enquiry. Please try again. or just sent your querry at sales@yantraindia.com'
//                     });
//                 });
//         } else {
//             console.log("Please fix form errors before submitting:", formErrors);
//         }
//     };


//     const closeStatusPopup = () => {
//         setSubmitStatus({ ...submitStatus, show: false });
//         setIsOpen(false);
//     };


//     return ( 

//         <>
//             {
//                 isOpen && 


//                 <div className={styles.popUpForm}>
//             <div className={styles.popUpFormBox}>
//                 <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
//                     <Image src="/images/close.png" alt="Close" width={28} height={28} />
//                 </button>

//                 {submitStatus.show && (
//                         <div className={`${styles.formPopup} ${submitStatus.success ? styles.success : (submitStatus.loading ? styles.loading : styles.error)}`}>
//                             <div className={styles.formPopupContent}>
//                                 {submitStatus.loading ? (
//                                     <div className={styles.loadingSpinner}>
//                                         <div className={styles.spinner}></div>
//                                         <p>{submitStatus.message}</p>
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <p>{submitStatus.message}</p>
//                                         <button onClick={closeStatusPopup}>Okay</button>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                 <form onSubmit={handleSubmit}>
//                     <p className={styles.linkTitle}>ENQUIRY FORM</p>
//                     <div className={styles.formInputs}>
//                         <div className={styles.inputBox}>
//                             <label className={`${formData.name ? styles.active : ''}`}>Name</label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleInputChange}
//                                 placeholder="Name: John Doe"
//                                 required
//                             />
//                             {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
//                         </div>
//                         <div className={styles.inputBox}>
//                             <label className={`${formData.mobile ? styles.active : ''}`}>Mobile No.</label>
//                             <input
//                                 type="text"
//                                 name="mobile"
//                                 value={formData.mobile}
//                                 onChange={handleInputChange}
//                                 placeholder="Mobile No: 9292929292"
//                                 required
//                             />
//                             {formErrors.mobile && <p className={styles.error}>{formErrors.mobile}</p>}
//                         </div>
//                         <div className={styles.inputBox}>
//                             <label className={`${formData.email ? styles.active : ''}`}>Email</label>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleInputChange}
//                                 placeholder="Email: mail@example.com"
//                                 required
//                             />
//                             {formErrors.email && <p className={styles.error}>{formErrors.email}</p>}
//                         </div>
//                         <div className={styles.inputBox}>
//                             <label className={`${formData.state ? styles.active : ''}`}>State</label>
//                             <select
//                                 name="state"
//                                 value={formData.state}
//                                 onChange={handleInputChange}
//                                 required
//                             >
//                                 <option value="Select State">Select State</option>
//                                   <option value="Andhra Pradesh">Andhra Pradesh</option>
//                                   <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
//                                   <option value="Arunachal Pradesh">Arunachal Pradesh</option>
//                                   <option value="Assam">Assam</option>
//                                   <option value="Bihar">Bihar</option>
//                                   <option value="Chandigarh">Chandigarh</option>
//                                   <option value="Chhattisgarh">Chhattisgarh</option>
//                                   <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
//                                   <option value="Daman and Diu">Daman and Diu</option>
//                                   <option value="Delhi">Delhi</option>
//                                   <option value="Lakshadweep">Lakshadweep</option>
//                                  <option value="Puducherry">Puducherry</option>
//                                  <option value="Karnataka">Karnataka</option>
//                                  <option value="Kerala">Kerala</option>
//                                  <option value="Goa">Goa</option>
//                                  <option value="Gujarat">Gujarat</option>
//                                  <option value="Haryana">Haryana</option>
//                                  <option value="Himachal Pradesh">Himachal Pradesh</option>
//                                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
//                                  <option value="Jharkhand">Jharkhand</option>
//                                  <option value="Kerala">Kerala</option>
//                                  <option value="Madhya Pradesh">Madhya Pradesh</option>
//                                  <option value="Maharashtra">Maharashtra</option>
//                                  <option value="Manipur">Manipur</option>
//                                  <option value="Meghalaya">Meghalaya</option>
//                                  <option value="Mizoram">Mizoram</option>
//                                 <option value="Nagaland">Nagaland</option>
//                                 <option value="Odisha">Odisha</option>
//                                 <option value="Punjab">Punjab</option>
//                                 <option value="Rajasthan">Rajasthan</option>
//                                 <option value="Sikkim">Sikkim</option>
//                                 <option value="Tamil Nadu">Tamil Nadu</option>
//                                 <option value="Telangana">Telangana</option>
//                                 <option value="Tripura">Tripura</option>
//                                 <option value="Uttar Pradesh">Uttar Pradesh</option>
//                                 <option value="Uttarakhand">Uttarakhand</option>
//                                 <option value="West Bengal">West Bengal</option>
//                             </select>
//                             {formErrors.state && <p className={styles.error}>{formErrors.state}</p>}
//                         </div>
//                         <div className={styles.inputBox}>
//                             <label className={`${formData.role ? styles.active : ''}`}>Your Role</label>
//                             <select
//                                 name="role"
//                                 value={formData.role}
//                                 onChange={handleInputChange}
//                                 required
//                             >
//                                 <option value="Select Role">Select Role</option>
//                                 <option value="Home Owner">Home Owner</option>
//                                 <option value="Interior Designer">Interior Designer</option>
//                                 <option value="Architect">Architect</option>
//                                 <option value="Project Management Consultant">Project Management Consultant</option>
//                                 <option value="Others">Others</option>

//                             </select>
//                             {formErrors.role && <p className={styles.error}>{formErrors.role}</p>}
//                         </div>
//                         <div className={styles.inputBox}>
//                             <label className={`${formData.requirement ? styles.active : ''}`}>Your Requirement</label>
//                             <select
//                                 name="requirement"
//                                 value={formData.requirement}
//                                 onChange={handleInputChange}
//                                 required
//                             >
//                                 <option value="Select Requirement">Select Requirement</option>
//                                 <option value="Design">Design</option>
//                                 <option value="Architecture">Architecture</option>
//                                 <option value="Interior">Interior</option>
//                                 <option value="Construction">Construction</option>
//                             </select>
//                             {formErrors.requirement && <p className={styles.error}>{formErrors.requirement}</p>}
//                         </div>
//                     </div>
//                     <button className={styles.cta} type="submit">
//                         <p>ENQUIRE NOW</p>
//                         <Image src="/images/arrow.png" alt="Arrow" width={28} height={28} />
//                     </button>
//                 </form>
//             </div>
//         </div>
//         }

//         {

//         }

//         </>

//     );
// }

// export default PopUpForm;


'use client';
import styles from './styles.module.css';

import Image from 'next/image';

import { useState, useEffect } from 'react';

import {useRouter} from 'next/navigation';

import submitJson from "submitjson";

function PopUpForm() {

    const router = useRouter();

    const redirectToThankyou = (name) => {
        // sessionStorage.setItem('name', name);
        router.push('/thankyou');
    };

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 7000);

        return () => clearTimeout(timer);
    }, []);

    const sj = new submitJson({
        apiKey: process.env.NEXT_PUBLIC_SUBMIT_JSON_KEY,
        endpoint: process.env.NEXT_PUBLIC_SUBMIT_JSON_ENDPOINT
    });

    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        city: '',
        role: '',
        requirement: ''
    });
    const [submitStatus, setSubmitStatus] = useState({
        show: false,
        success: false,
        loading: false,
        message: ''
    });

    const validateInput = (field, value) => {
        let error = '';
        switch (field) {
            case 'name':
                if (!value.trim()) error = "Name is required.";
                break;
            case 'mobile':
                if (!/^\d{10}$/.test(value)) error = "Mobile number should be 10 digits long.";
                break;
            case 'email':
                if (!/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = "Invalid email address.";
                break;
            case 'city':
                if (!value.trim()) error = "City is required.";
                break;
            case 'role':
                if (value === 'Select Role') error = "Please select a valid role.";
                break;
            case 'requirement':
                if (value === 'Select Requirement') error = "Please select a valid requirement.";
                break;
            default:
                break;
        }
        setFormErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateInput(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        Object.keys(formData).forEach((key) => validateInput(key, formData[key]));

        const hasErrors = Object.values(formErrors).some((error) => error !== '');

        if (!hasErrors) {
            setSubmitStatus({
                show: true,
                success: false,
                loading: true,
                message: 'Submitting your enquiry...'
            });

            sj.submit(formData)
                .then((response) => {
                    if (response.data) {
                        setSubmitStatus({
                            show: true,
                            success: true,
                            loading: false,
                            message: 'Your enquiry has been submitted successfully!'
                        });

                        redirectToThankyou(formData.name);

                        setFormData({
                            name: '',
                            mobile: '',
                            email: '',
                            city: '',
                            role: '',
                            requirement: ''
                        });
                    } else {
                        setSubmitStatus({
                            show: true,
                            success: false,
                            loading: false,
                            message: 'Failed to submit enquiry. Please try again or email us at sales@yantraindia.com'
                        });
                    }
                })
                .catch((error) => {
                    setSubmitStatus({
                        show: true,
                        success: false,
                        loading: false,
                        message: 'Failed to submit enquiry. Please try again or email us at sales@yantraindia.com'
                    });
                });
        }
    };

    const closeStatusPopup = () => {
        setSubmitStatus({ ...submitStatus, show: false });
        setIsOpen(false);
    };

    

    return (
        <>
            {isOpen && (
                <div className={styles.popUpForm}>
                    <div className={styles.popUpFormBox}>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <Image src="/images/close.png" alt="Close" width={28} height={28} />
                        </button>

                        {submitStatus.show && (
                            <div
                                className={`${styles.formPopup} ${submitStatus.success ? styles.success : (submitStatus.loading ? styles.loading : styles.error)}`}
                            >
                                <div className={styles.formPopupContent}>
                                    {submitStatus.loading ? (
                                        <div className={styles.loadingSpinner}>
                                            <div className={styles.spinner}></div>
                                            <p>{submitStatus.message}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p>{submitStatus.message}</p>
                                            <button onClick={closeStatusPopup}>Okay</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <p className={styles.linkTitle}>ENQUIRY FORM</p>
                            <div className={styles.formInputs}>
                            <div className={styles.inputBox}>
                             <label className={`${formData.name ? styles.active : ''}`}>Name</label>
                             <input
                                 type="text"
                                 name="name"
                                 value={formData.name}
                                 onChange={handleInputChange}
                                 placeholder="Name: John Doe"
                                 required
                             />
                             {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
                         </div>
                         <div className={styles.inputBox}>
                             <label className={`${formData.mobile ? styles.active : ''}`}>Mobile No.</label>
                             <input
                                 type="text"
                                 name="mobile"
                                 value={formData.mobile}
                                 onChange={handleInputChange}
                                 placeholder="Mobile No: 9292929292"
                                 required
                             />
                             {formErrors.mobile && <p className={styles.error}>{formErrors.mobile}</p>}
                         </div>
                         <div className={styles.inputBox}>
                             <label className={`${formData.email ? styles.active : ''}`}>Email</label>
                             <input
                                 type="email"
                                 name="email"
                                 value={formData.email}
                                 onChange={handleInputChange}
                                 placeholder="Email: mail@example.com"
                                 required
                             />
                             {formErrors.email && <p className={styles.error}>{formErrors.email}</p>}
                         </div>
                                <div className={styles.inputBox}>
                                    <label className={`${formData.city ? styles.active : ''}`}>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="City: Mumbai"
                                        required
                                    />
                                    {formErrors.city && <p className={styles.error}>{formErrors.city}</p>}
                                </div>
                            <div className={styles.inputBox}>
                             <label className={`${formData.role ? styles.active : ''}`}>Your Role</label>
                             <select
                                 name="role"
                                 value={formData.role}
                                 onChange={handleInputChange}
                                 required
                             >
                                 <option value="Select Role">Select Role</option>
                                 <option value="Home Owner">Home Owner</option>
                                 <option value="Interior Designer">Interior Designer</option>
                                 <option value="Architect">Architect</option>
                                 <option value="Project Management Consultant">Project Management Consultant</option>
                                 <option value="Others">Others</option>

                             </select>
                             {formErrors.role && <p className={styles.error}>{formErrors.role}</p>}
                         </div>
                         <div className={styles.inputBox}>
                             <label className={`${formData.requirement ? styles.active : ''}`}>Your Requirement</label>
                             <select
                                 name="requirement"
                                 value={formData.requirement}
                                 onChange={handleInputChange}
                                 required>
                                 <option value="Select Requirement">Select Requirement</option>
                                 <option value="Apartment">Apartment</option>
                                 <option value="Villa">Villa</option>
                                 <option value="Commercial">Commercial</option>
                                 <option value="Hospitality">Hospitality</option>
                                 <option value="Other">Other</option>
                             </select>
                             {formErrors.requirement && <p className={styles.error}>{formErrors.requirement}</p>}
                         </div>
                            </div>
                            <button className={styles.cta} type="submit">
                                <p>ENQUIRE NOW</p>
                                <Image src="/images/arrow.png" alt="Arrow" width={28} height={28} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default PopUpForm;
