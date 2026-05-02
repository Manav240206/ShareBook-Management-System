const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');
const User = require('./models/User');
const bcrypt = require('bcrypt');

dotenv.config();

const indianBooksData = [
  { title: "The Guide", author: "R.K. Narayan" },
  { title: "Malgudi Days", author: "R.K. Narayan" },
  { title: "Swami and Friends", author: "R.K. Narayan" },
  { title: "The God of Small Things", author: "Arundhati Roy" },
  { title: "The White Tiger", author: "Aravind Adiga" },
  { title: "Midnight's Children", author: "Salman Rushdie" },
  { title: "A Fine Balance", author: "Rohinton Mistry" },
  { title: "Train to Pakistan", author: "Khushwant Singh" },
  { title: "The Discovery of India", author: "Jawaharlal Nehru" },
  { title: "Ignited Minds", author: "A.P.J. Abdul Kalam" },
  { title: "Wings of Fire", author: "A.P.J. Abdul Kalam" },
  { title: "Godan", author: "Munshi Premchand" },
  { title: "Gitanjali", author: "Rabindranath Tagore" },
  { title: "The Namesake", author: "Jhumpa Lahiri" },
  { title: "Interpreter of Maladies", author: "Jhumpa Lahiri" },
  { title: "The Palace of Illusions", author: "Chitra Banerjee Divakaruni" },
  { title: "The Immortals of Meluha", author: "Amish Tripathi" },
  { title: "The Secret of the Nagas", author: "Amish Tripathi" },
  { title: "The Oath of the Vayuputras", author: "Amish Tripathi" },
  { title: "Scion of Ikshvaku", author: "Amish Tripathi" },
  { title: "Two States", author: "Chetan Bhagat" },
  { title: "Five Point Someone", author: "Chetan Bhagat" },
  { title: "Half Girlfriend", author: "Chetan Bhagat" },
  { title: "I Too Had a Love Story", author: "Ravinder Singh" },
  { title: "Chanakya's Chant", author: "Ashwin Sanghi" },
  { title: "The Rozabal Line", author: "Ashwin Sanghi" },
  { title: "The Room on the Roof", author: "Ruskin Bond" },
  { title: "The Blue Umbrella", author: "Ruskin Bond" },
  { title: "A Flight of Pigeons", author: "Ruskin Bond" },
  { title: "Shantaram", author: "Gregory David Roberts" },
  { title: "Sacred Games", author: "Vikram Chandra" },
  { title: "A Suitable Boy", author: "Vikram Seth" },
  { title: "The Inheritance of Loss", author: "Kiran Desai" },
  { title: "The Glass Palace", author: "Amitav Ghosh" },
  { title: "The Shadow Lines", author: "Amitav Ghosh" },
  { title: "Sea of Poppies", author: "Amitav Ghosh" },
  { title: "Fasting, Feasting", author: "Anita Desai" },
  { title: "Clear Light of Day", author: "Anita Desai" },
  { title: "The Argumentative Indian", author: "Amartya Sen" },
  { title: "An Era of Darkness", author: "Shashi Tharoor" },
  { title: "Inglorious Empire", author: "Shashi Tharoor" },
  { title: "India After Gandhi", author: "Ramachandra Guha" },
  { title: "Maximum City", author: "Suketu Mehta" },
  { title: "The Twentieth Wife", author: "Indu Sundaresan" },
  { title: "The Far Pavilions", author: "M.M. Kaye" },
  { title: "Nectar in a Sieve", author: "Kamala Markandaya" },
  { title: "The Moor's Last Sigh", author: "Salman Rushdie" },
  { title: "Shalimar the Clown", author: "Salman Rushdie" },
  { title: "Cuckold", author: "Kiran Nagarkar" },
  { title: "Raag Darbari", author: "Shrilal Shukla" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sharebook');
    console.log('Connected to MongoDB');

    let adminSeller = await User.findOne({ email: 'admin@sharebook.com' });
    if (!adminSeller) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminSeller = new User({
        name: 'System Admin',
        email: 'admin@sharebook.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminSeller.save();
    }

    // Clear existing books
    await Book.deleteMany({ sellerId: adminSeller._id });
    console.log('Cleared existing seeded books');

    const conditions = ['New', 'Like New', 'Good', 'Acceptable'];

    const booksToInsert = indianBooksData.map(book => {
      // Random price between ₹150 and ₹999
      const randomPrice = Math.floor(Math.random() * 850) + 150;
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      return {
        title: book.title,
        author: book.author,
        description: `A fantastic copy of the famous Indian book ${book.title} by ${book.author}. A must-read classic.`,
        price: randomPrice,
        sellerId: adminSeller._id,
        condition: randomCondition,
        status: 'available',
        image: `https://via.placeholder.com/150?text=${encodeURIComponent(book.title)}`
      };
    });

    await Book.insertMany(booksToInsert);
    console.log(`Successfully seeded ${booksToInsert.length} Indian books!`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDB();
