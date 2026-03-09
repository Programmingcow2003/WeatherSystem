import java.util.Random;
import java.lang.Math;

public class Sensor
  {
     public static void main(String[] args)
    {

      //Sets up random class and initalizes double
      Random rand = new Random();
      double signalStrength = rand.nextDouble() * 10;
      

      //This will eventually be continuous but want it to run through
      for(int i = 0; i < 100; i++)
      {

        //Signal can change between -0.5.0.5
        double change = - 0.5 + rand.nextDouble();
        signalStrength += change;

        //Makes sure signal stays in bounds
        if(signalStrength > 10)
          signalStrength = 10;

        if(signalStrength < 0)
          signalStrength = 0;

        //Prints signal strength
        system.out.println(signalStrength);
      }

      
    }
  }
