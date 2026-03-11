import java.util.Random;
import java.lang.Math;

public class Sensor
  {
     public static void main(String[] args)
    {

      //Sets up random class and initalizes double
      Random rand = new Random();
      double signalStrength = rand.nextDouble() * 10;
      

      //This will eventually be continuous but want it to finish so it can pass the tests
      for(int i = 0; i < 100; i++)
      {

        //This will simulate retransmission will be implemented for real when applicable
        bool failed_odds = 0;

        //Signal can change between -0.5.0.5 per iteration
        double change = - 0.5 + rand.nextDouble();
        signalStrength += change;

        //Makes sure signal stays in bounds
        if(signalStrength > 10)
          signalStrength = 10;

        if(signalStrength < 0)
          signalStrength = 0;

        //Prints signal strength
        System.out.println(signalStrength);

        //Random chance of it failing to send
        failed_odds = rand.nextInt(1, 11);

        if(failed_odds == 10)
          System.out.println("Previous signal failed to send, resending " + signalStrength);
      }

      //Some things such as adding the wrapper and controlling pipeline are a bit early to be adding at this stage
      //These details will become implemented when applicable

      
    }
  }
